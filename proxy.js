import { NextResponse } from "next/server";

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  console.log(`Proxy checking path: ${pathname}`);

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");
    console.log(`Session cookie found: ${!!sessionCookie}`);

    if (!sessionCookie) {
      console.log("No session cookie, redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      console.log(`Session role: ${session.role}, slug: ${session.slug}`);
      
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
    } catch (error) {
      // Invalid JSON or format
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
