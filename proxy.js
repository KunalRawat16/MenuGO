import { NextResponse } from 'next/server';

// ============================================================
// RATE LIMITING ENGINE
// ============================================================
const rateLimitStore = new Map();
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60 * 1000) return;
  lastCleanup = now;
  for (const [key, data] of rateLimitStore) {
    if (now - data.windowStart > 120 * 1000) rateLimitStore.delete(key);
  }
}

function checkRateLimit(identifier, maxRequests, windowMs) {
  cleanupExpiredEntries();
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now });
    return { limited: false, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { limited: true, remaining: 0, retryAfterSec };
  }

  return { limited: false, remaining: maxRequests - entry.count, retryAfterSec: 0 };
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

// ============================================================
// PROXY ENGINE (Next.js 16 convention)
// ============================================================

const COOKIE_NAME = 'menugo_session';

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // ----------------------------------------------------------
  // 1. RATE LIMITING (API routes)
  // ----------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request);

    // Rule 1: Order Creation (5 per min)
    if (pathname === '/api/orders' && method === 'POST') {
      const { limited, remaining, retryAfterSec } = checkRateLimit(`order_create:${ip}`, 5, 60 * 1000);
      if (limited) {
        return NextResponse.json(
          { success: false, error: `Too many orders. Please wait ${retryAfterSec}s.` },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
        );
      }
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', '5');
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      return response;
    }

    // Rule 2: General API (60 per min)
    const { limited } = checkRateLimit(`api_general:${ip}`, 60, 60 * 1000);
    if (limited) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // ----------------------------------------------------------
  // 2. ROUTE PROTECTION & RBAC
  // ----------------------------------------------------------
  const sessionCookie = request.cookies.get(COOKIE_NAME);

  // /dashboard/* — requires role: owner, super_admin, or staff
  if (pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      const session = JSON.parse(sessionCookie.value);
      if (!['owner', 'super_admin', 'staff'].includes(session?.role)) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // /admin/* — requires role: super_admin only
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session?.role !== 'super_admin') {
        const dest = session?.role === 'owner' ? '/dashboard' : '/auth/login';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // /onboard — requires authenticated owner
  if (pathname.startsWith('/onboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      const session = JSON.parse(sessionCookie.value);
      if (!session?.role) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      if (session?.isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // /auth/* — redirect authenticated users to their home
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session?.role === 'super_admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (session?.role === 'owner' && session?.isOnboarded) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (session?.role === 'owner' && !session?.isOnboarded) {
          return NextResponse.redirect(new URL('/onboard', request.url));
        }
      } catch {
        // Invalid cookie
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
