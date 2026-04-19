import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { slug, itemId } = await params;
    const body = await request.json();
    await dbConnect();

    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const itemIndex = restaurant.menuItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    // Merge updates
    const existingItem = restaurant.menuItems[itemIndex].toObject ? restaurant.menuItems[itemIndex].toObject() : restaurant.menuItems[itemIndex];
    restaurant.menuItems[itemIndex] = { ...existingItem, ...body };
    
    await restaurant.save();

    return NextResponse.json({ success: true, data: restaurant.menuItems[itemIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { slug, itemId } = await params;
    await dbConnect();

    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const initialLength = restaurant.menuItems.length;
    restaurant.menuItems = restaurant.menuItems.filter(item => item.id !== itemId);
    
    if (restaurant.menuItems.length === initialLength) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    await restaurant.save();

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
