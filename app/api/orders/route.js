import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.restaurantId || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order data" },
        { status: 400 }
      );
    }

    // Load the restaurant to get database menu items & prices
    const restaurant = await Restaurant.findById(data.restaurantId);
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    // Create a lookup map of menu items by ID
    const menuMap = new Map();
    restaurant.menuItems.forEach(item => {
      menuMap.set(item.id, item);
    });

    let calculatedTotalPrice = 0;
    const validatedItems = [];

    // Server-side validation of item existence, availability, and prices
    for (const orderItem of data.items) {
      const dbItem = menuMap.get(orderItem.id);
      if (!dbItem) {
        return NextResponse.json(
          { success: false, error: `Menu item with ID ${orderItem.id} is not found.` },
          { status: 400 }
        );
      }
      if (dbItem.isAvailable === false) {
        return NextResponse.json(
          { success: false, error: `Menu item "${dbItem.name}" is currently out of stock.` },
          { status: 400 }
        );
      }

      // Enforce valid positive integer quantities
      const quantity = Math.max(1, Math.floor(Number(orderItem.quantity) || 1));
      
      // Calculate server price based on verified DB price
      const price = dbItem.price;
      calculatedTotalPrice += price * quantity;

      validatedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        price: price,
        quantity: quantity,
        category: dbItem.category,
        isVeg: dbItem.isVeg
      });
    }

    // Construct clean validated order object
    const finalOrderData = {
      restaurantId: restaurant._id,
      restaurantSlug: restaurant.slug,
      items: validatedItems,
      totalPrice: calculatedTotalPrice,
      customerName: String(data.customerName || "Guest").trim(),
      tableNumber: String(data.tableNumber || "0").trim(),
      status: "Pending" // Force default status on creation
    };

    const order = await Order.create(finalOrderData);

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

    // Verify admin session for GET /api/orders
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    let session;
    try {
      session = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    let query = {};
    if (restaurantId) {
      query.restaurantId = restaurantId;
      // Fetch restaurant slug to verify permissions
      const restaurant = await Restaurant.findById(restaurantId).lean();
      if (!restaurant) {
        return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
      }
      if (session.role !== "superadmin" && session.slug !== restaurant.slug) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    } else if (slug) {
      query.restaurantSlug = slug;
      if (session.role !== "superadmin" && session.slug !== slug) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    } else {
      // Only superadmin can fetch all orders without filters
      if (session.role !== "superadmin") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }
    
    let queryLimit = 50;

    if (history === "true") {
      query.status = { $in: ['Completed', 'Cancelled'] };
      queryLimit = 100;
    } else if (status) {
      query.status = status;
    } else {
      // Default to live active orders
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

    // Verify admin authorization
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const session = JSON.parse(sessionCookie);
      const restaurant = await Restaurant.findById(restaurantId).lean();
      if (!restaurant) {
        return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
      }
      if (session.role !== "superadmin" && session.slug !== restaurant.slug) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
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
