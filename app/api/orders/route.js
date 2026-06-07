import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    const order = await Order.create(data);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");
    const history = searchParams.get("history");

    let query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (slug) query.restaurantSlug = slug;
    
    let queryLimit = 50;

    if (history === "true") {
      query.status = { $in: ['Completed', 'Cancelled'] };
      queryLimit = 100;
    } else if (status) {
      query.status = status;
    } else if (restaurantId) {
      // If we're fetching for admin but no status specified, usually we want "live" orders
      query.status = { $nin: ['Completed', 'Cancelled'] };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(queryLimit)
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId is required" },
        { status: 400 }
      );
    }

    // Delete only Completed and Cancelled orders
    const result = await Order.deleteMany({
      restaurantId,
      status: { $in: ['Completed', 'Cancelled'] }
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
