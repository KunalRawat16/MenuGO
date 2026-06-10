import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { cookies } from "next/headers";

// Helper to check admin authorization for a specific order
async function verifyAdminForOrder(orderToCheck) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  if (!sessionCookie) return { authorized: false, error: "Unauthorized", status: 401 };

  try {
    const session = JSON.parse(sessionCookie);
    if (session.role === "superadmin") return { authorized: true };
    if (session.slug === orderToCheck.restaurantSlug) return { authorized: true };
    return { authorized: false, error: "Forbidden", status: 403 };
  } catch {
    return { authorized: false, error: "Invalid session", status: 401 };
  }
}

export async function GET(req, props) {
  try {
    const params = await props.params;
    const { orderId } = params;
    await dbConnect();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, props) {
  try {
    const params = await props.params;
    const { orderId } = params;
    await dbConnect();
    const { status } = await req.json();

    if (!['Pending', 'Preparing', 'Served', 'Completed', 'Cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Load order to verify ownership
    const orderToCheck = await Order.findById(orderId);
    if (!orderToCheck) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const auth = await verifyAdminForOrder(orderToCheck);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const isCompletedOrCancelled = ['Completed', 'Cancelled'].includes(status);
    const updateFields = { 
      status, 
      updatedAt: Date.now(),
      completedAt: isCompletedOrCancelled ? Date.now() : null
    };

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    );

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, props) {
  try {
    const params = await props.params;
    const { orderId } = params;
    await dbConnect();

    // Load order to verify ownership
    const orderToCheck = await Order.findById(orderId);
    if (!orderToCheck) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const auth = await verifyAdminForOrder(orderToCheck);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
