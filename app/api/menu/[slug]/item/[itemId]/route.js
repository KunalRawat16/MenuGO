import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper to check authentication
async function verifyAuth(slug) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  if (!sessionCookie) return { authorized: false, error: "Unauthorized", status: 401 };

  try {
    const session = JSON.parse(sessionCookie);
    if (session.role !== "superadmin" && session.slug !== slug) {
      return { authorized: false, error: "Forbidden", status: 403 };
    }
    return { authorized: true };
  } catch {
    return { authorized: false, error: "Invalid session", status: 401 };
  }
}

export async function PUT(request, { params }) {
  try {
    const { slug, itemId } = await params;

    // Check authorization
    const auth = await verifyAuth(slug);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    await dbConnect();

    // Prepare atomic update object for subdocument fields
    const updateObj = {};
    for (const key in body) {
      if (key !== "id") {
        updateObj[`menuItems.$.${key}`] = body[key];
      }
    }

    const result = await Restaurant.updateOne(
      { slug, "menuItems.id": itemId },
      { $set: updateObj }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Restaurant or Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { slug, itemId } = await params;

    // Check authorization
    const auth = await verifyAuth(slug);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await dbConnect();

    // Atomic $pull to remove item from the array
    const result = await Restaurant.updateOne(
      { slug },
      { $pull: { menuItems: { id: itemId } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
