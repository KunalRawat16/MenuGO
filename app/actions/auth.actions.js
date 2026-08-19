'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import Category from '@/models/Category';
import PlatformSettings from '@/models/PlatformSettings';
import { createSession, destroySession, getSession, hashPassword, verifyPassword, isHashed } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────────────
// REGISTER (Business Owner)
// ─────────────────────────────────────────────────────────────────────

export async function registerAction(formData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().toLowerCase().trim();
  const password = formData.get('password')?.toString();
  const country = formData.get('country')?.toString() || '';

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  await dbConnect();

  // Duplicate email check
  const existing = await User.findOne({ email });
  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'owner',
    country,
    isActive: true,
    isOnboarded: false,
  });

  // Create a stub Business (fully set up during /onboard wizard)
  const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  let slug = baseSlug;
  let counter = 1;
  while (await Business.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const settings = await _getOrCreatePlatformSettings();
  const trialDays = settings.trialDurationDays || 14;

  const business = await Business.create({
    ownerId: user._id,
    name,
    slug,
    isActive: true,
    subscription: {
      plan: 'trial',
      status: 'active',
      trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
    },
  });

  // Link business to user
  await User.updateOne({ _id: user._id }, { restaurantId: business._id });

  // Write session cookie
  await createSession({
    userId: user._id.toString(),
    role: 'owner',
    restaurantId: business._id.toString(),
    restaurantSlug: slug,
    name: user.name,
    isOnboarded: false,
  });

  return { success: true, redirect: '/onboard' };
}

// ─────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────

export async function loginAction(formData) {
  const email = formData.get('email')?.toString().toLowerCase().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  await dbConnect();

  // ── Super Admin check (from PlatformSettings) ─────────────────────
  const settings = await _getOrCreatePlatformSettings();
  if (email === (settings.superadminUsername || 'superadmin@gmail.com')) {
    const match = await verifyPassword(password, settings.superadminPassword);
    if (match) {
      // Auto-migrate legacy plaintext password
      if (!isHashed(settings.superadminPassword)) {
        await PlatformSettings.updateOne(
          { id: 'global_settings' },
          { superadminPassword: await hashPassword(password) }
        );
      }
      await createSession({
        userId: 'superadmin',
        role: 'super_admin',
        restaurantId: null,
        restaurantSlug: null,
        name: 'Super Admin',
        isOnboarded: true,
      });
      return { success: true, redirect: '/admin' };
    }
    return { error: 'Invalid credentials.' };
  }

  // ── Business Owner / Staff check ──────────────────────────────────
  const user = await User.findOne({ email });
  if (!user) return { error: 'Invalid credentials.' };
  if (!user.isActive) return { error: 'Your account has been deactivated. Contact support.' };

  const match = await verifyPassword(password, user.passwordHash);
  if (!match) return { error: 'Invalid credentials.' };

  // Auto-migrate legacy plaintext
  if (!isHashed(user.passwordHash)) {
    await User.updateOne({ _id: user._id }, { passwordHash: await hashPassword(password) });
  }

  // Update last login
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  // Build session
  let restaurantSlug = null;
  if (user.restaurantId) {
    const business = await Business.findById(user.restaurantId).select('slug');
    restaurantSlug = business?.slug || null;
  }

  await createSession({
    userId: user._id.toString(),
    role: user.role,
    restaurantId: user.restaurantId?.toString() || null,
    restaurantSlug,
    name: user.name,
    isOnboarded: user.isOnboarded,
  });

  const redirect = user.isOnboarded ? '/dashboard' : '/onboard';
  return { success: true, redirect };
}

// ─────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await destroySession();
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD (token-based — stored in User model)
// ─────────────────────────────────────────────────────────────────────

export async function requestPasswordResetAction(formData) {
  const email = formData.get('email')?.toString().toLowerCase().trim();
  if (!email) return { error: 'Email is required.' };

  await dbConnect();
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  // TODO: Generate token, store in DB, send email via nodemailer/Resend
  // For now: log token for dev testing
  const token = Math.random().toString(36).slice(2);
  console.log(`[DEV] Password reset token for ${email}: ${token}`);

  return { success: true };
}

export async function resetPasswordAction(formData) {
  const token = formData.get('token')?.toString();
  const password = formData.get('password')?.toString();

  if (!token || !password) return { error: 'Invalid request.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  // TODO: Validate token from DB
  return { error: 'Password reset via email is coming soon.' };
}

// ─────────────────────────────────────────────────────────────────────
// GET CURRENT SESSION (for client components via API)
// ─────────────────────────────────────────────────────────────────────

export async function getSessionAction() {
  const session = await getSession();
  return { session };
}

// ─────────────────────────────────────────────────────────────────────
// Internal helper
// ─────────────────────────────────────────────────────────────────────

async function _getOrCreatePlatformSettings() {
  let s = await PlatformSettings.findOne({ id: 'global_settings' });
  if (!s) {
    s = await PlatformSettings.create({
      id: 'global_settings',
      superadminUsername: 'superadmin@gmail.com',
      superadminPassword: await hashPassword('admin123'),
    });
  }
  return s;
}
