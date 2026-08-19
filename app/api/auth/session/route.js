import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/session
 * Returns the currently authenticated user's session from the HttpOnly cookie.
 * Used by client components for auth context state.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ success: false, session: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[Session API Error]:", error);
    return NextResponse.json(
      { success: false, session: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
