import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Business from "@/models/Business";
import Restaurant from "@/models/Restaurant";
import { getSession } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────
// POST /api/orders — Create order (Public customer endpoint)
// ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    const restaurantId = data.restaurantId || data.businessId;
    const slug = data.restaurantSlug || data.slug;

    if ((!restaurantId && !slug) || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order payload: missing restaurant or items" },
        { status: 400 }
      );
    }

    // 1. Fetch business details (check Business model first, fall back to Restaurant model)
    let business = null;
    if (restaurantId) {
      business = await Business.findById(restaurantId).lean();
    }
    if (!business && slug) {
      business = await Business.findOne({ slug }).lean();
    }
    if (!business && restaurantId) {
      business = await Restaurant.findById(restaurantId).lean();
    }

    if (!business) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const bizSlug = business.slug;
    const bizId = business._id;

    // 2. Format order items
    const formattedItems = data.items.map((item) => ({
      menuItemId: item.menuItemId || item.id || item._id,
      name: item.name,
      price: Number(item.price),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      image: item.image || null,
      dietary: item.dietary || null,
      specialRequest: item.specialRequest || item.notes || "",
    }));

    // 3. Compute total amount
    const computedTotal = data.totalAmount || data.totalPrice || formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4. Create Order document adhering to OrderSchema
    const order = await Order.create({
      restaurantId: bizId,
      restaurantSlug: bizSlug,
      tableId: data.tableId || null,
      tableNumber: data.tableNumber || "T1",
      customerName: String(data.customerName || "Guest").trim(),
      specialInstructions: String(data.specialInstructions || "").trim(),
      items: formattedItems,
      totalAmount: computedTotal,
      orderSource: data.orderSource || "dine-in",
      status: "incoming",
    });

    const orderObj = JSON.parse(JSON.stringify(order));

    // 5. Broadcast real-time SSE event to owner dashboard & customer tracker
    try {
      const { orderEmitter } = await import("@/lib/sse");
      orderEmitter.emit(`order:${bizSlug}`, { event: "order_created", order: orderObj });
      orderEmitter.emit(`order:${order._id}`, { event: "order_created", order: orderObj });
    } catch {
      // SSE broadcast failure is non-blocking
    }

    return NextResponse.json({ success: true, order: orderObj }, { status: 201 });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/orders — Fetch orders for dashboard
// ─────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");
    const history = searchParams.get("history");

    const session = await getSession();

    let query = {};
    if (restaurantId) {
      query.restaurantId = restaurantId;
    } else if (slug) {
      query.restaurantSlug = slug;
    } else if (session?.restaurantId) {
      query.restaurantId = session.restaurantId;
    }

    let queryLimit = 50;

    if (history === "true") {
      query.status = { $in: ["completed", "cancelled", "Completed", "Cancelled"] };
      queryLimit = 100;
    } else if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(queryLimit)
      .lean();

    return NextResponse.json({ success: true, orders: JSON.parse(JSON.stringify(orders)) });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/orders — Clear completed/cancelled orders
// ─────────────────────────────────────────────────────────────────────
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const targetId = restaurantId || session.restaurantId;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "restaurantId is required" }, { status: 400 });
    }

    const result = await Order.deleteMany({
      restaurantId: targetId,
      status: { $in: ["completed", "cancelled", "Completed", "Cancelled"] },
    });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Clear History Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
