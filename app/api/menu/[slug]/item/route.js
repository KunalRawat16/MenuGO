import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    // Verify session authentication & authorization
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    try {
      const session = JSON.parse(sessionCookie);
      if (session.role !== "superadmin" && session.slug !== slug) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    const newItem = {
      ...body,
      id: body.id || "m" + Date.now(),
    };

    // Use atomic operation instead of document save
    const result = await Restaurant.updateOne(
      { slug },
      { $push: { menuItems: newItem } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
