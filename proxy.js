import { NextResponse } from "next/server";

// ============================================================
// RATE LIMITING ENGINE
// ============================================================
// In-memory store: Map<string, { count: number, windowStart: number }>
// Works per-server instance. For distributed rate limiting, use Upstash Redis.
const rateLimitStore = new Map();
let lastCleanup = Date.now();

/** Remove expired entries to prevent memory leaks */
function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60 * 1000) return; // Cleanup every 1 minute
  lastCleanup = now;
  for (const [key, data] of rateLimitStore) {
    if (now - data.windowStart > 120 * 1000) rateLimitStore.delete(key);
  }
}

/**
 * Check if a request should be rate limited
 * @returns {{ limited: boolean, remaining: number, retryAfterSec: number }}
 */
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

/** Extract real client IP from request headers */
function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// ============================================================
// PROXY (Next.js 16 Middleware)
// ============================================================

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // ----------------------------------------------------------
  // 1. RATE LIMITING (API routes only)
  // ----------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(request);

    // Rule 1: Order Creation — STRICT (5 per minute per IP)
    if (pathname === "/api/orders" && method === "POST") {
      const { limited, remaining, retryAfterSec } = checkRateLimit(
        `order_create:${ip}`, 5, 60 * 1000
      );
      if (limited) {
        return NextResponse.json(
          { success: false, error: `Too many orders. Please wait ${retryAfterSec}s before trying again.` },
          { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
        );
      }
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", "5");
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      return response;
    }

    // Rule 2: Order Status Updates — MODERATE (20 per minute per IP)
    if (pathname.startsWith("/api/orders/") && method === "PATCH") {
      const { limited } = checkRateLimit(`order_update:${ip}`, 20, 60 * 1000);
      if (limited) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Please slow down." },
          { status: 429 }
        );
      }
    }

    // Rule 3: General API — RELAXED (60 per minute per IP)
    const { limited } = checkRateLimit(`api_general:${ip}`, 60, 60 * 1000);
    if (limited) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
  }

  // ----------------------------------------------------------
  // 2. AUTH PROTECTION (Admin routes)
  // ----------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      // If exact /admin path, requires superadmin
      if (pathname === "/admin" && session.role !== "superadmin") {
        return NextResponse.redirect(new URL(`/admin/${session.slug}`, request.url));
      }

      // If /admin/[slug] path, requires superadmin OR matching admin slug
      if (pathname.startsWith("/admin/")) {
        const targetSlug = pathname.split("/")[2]; // e.g. /admin/xyz-cafe -> xyz-cafe
        if (session.role !== "superadmin" && session.slug !== targetSlug) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    } catch {
      // Invalid JSON or format
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
