import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Session payload shape stored in the HttpOnly cookie.
 * @typedef {{ userId: string, role: 'super_admin'|'owner'|'staff', restaurantId: string|null, restaurantSlug: string|null, name: string }} SessionPayload
 */

const COOKIE_NAME = 'menugo_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

// ─────────────────────────────────────────────────────────────────────
// Session CRUD
// ─────────────────────────────────────────────────────────────────────

/**
 * Write a session cookie after successful login / register.
 * @param {SessionPayload} payload
 */
export async function createSession(payload) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Read and parse the current session cookie.
 * Returns null if cookie is absent or malformed.
 * @returns {SessionPayload|null}
 */
export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Delete the session cookie (logout).
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─────────────────────────────────────────────────────────────────────
// Route-level guards (for use inside Server Actions / Server Components)
// ─────────────────────────────────────────────────────────────────────

/**
 * Asserts that the caller is authenticated.
 * Returns the session or throws { error } object.
 * @returns {Promise<SessionPayload>}
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized: Please log in.' };
  return session;
}

/**
 * Asserts that the caller has one of the required roles.
 * @param {string[]} roles - e.g. ['owner', 'super_admin']
 * @returns {Promise<SessionPayload|{error: string}>}
 */
export async function requireRole(roles) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized: Please log in.' };
  if (!roles.includes(session.role)) {
    return { error: `Forbidden: This action requires role: ${roles.join(' or ')}.` };
  }
  return session;
}

/**
 * Tenant isolation guard for owner actions.
 * Ensures the acting owner is only touching their own restaurant's data.
 * Super admins bypass this check.
 *
 * @param {string} targetRestaurantId - The restaurant being modified
 * @returns {Promise<SessionPayload|{error: string}>}
 */
export async function requireRestaurantAccess(targetRestaurantId) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized: Please log in.' };

  // Super admins can access any restaurant
  if (session.role === 'super_admin') return session;

  // Owners can only touch their own restaurant
  if (session.restaurantId?.toString() !== targetRestaurantId?.toString()) {
    return { error: 'Forbidden: You can only manage your own restaurant.' };
  }

  return session;
}

// ─────────────────────────────────────────────────────────────────────
// Password helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plaintext password against a stored hash.
 * Also handles legacy plaintext passwords — auto-migrates to bcrypt on match.
 * @param {string} plaintext
 * @param {string} stored - bcrypt hash or legacy plaintext
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plaintext, stored) {
  if (!stored) return false;
  // bcrypt hash always starts with $2a$ or $2b$
  if (stored.startsWith('$2')) {
    return bcrypt.compare(plaintext, stored);
  }
  // Legacy plaintext comparison (will be migrated by caller)
  return plaintext === stored;
}

/**
 * Check if a stored password is already a bcrypt hash.
 * @param {string} stored
 * @returns {boolean}
 */
export function isHashed(stored) {
  return typeof stored === 'string' && stored.startsWith('$2');
}
