import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    await dbConnect();

    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const newItem = {
      ...body,
      id: body.id || "m" + Date.now(),
    };

    restaurant.menuItems.push(newItem);
    await restaurant.save();

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
