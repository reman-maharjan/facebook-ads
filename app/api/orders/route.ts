// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

// In-memory storage (replace with actual database in production)
const ordersStore = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, address, timestamp } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Store or update order data
    const existingOrder = ordersStore.get(userId) || {};
    const updatedOrder = {
      ...existingOrder,
      userId,
      name: name || existingOrder.name,
      email: email || existingOrder.email,
      phone: phone || existingOrder.phone,
      address: address || existingOrder.address,
      updatedAt: timestamp || new Date().toISOString(),
    };

    ordersStore.set(userId, updatedOrder);

    console.log("[Orders API] Saved order:", updatedOrder);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("[Orders API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      // Return all orders
      const allOrders = Array.from(ordersStore.values());
      return NextResponse.json({ orders: allOrders });
    }

    // Return specific user's order
    const order = ordersStore.get(userId);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("[Orders API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    ordersStore.delete(userId);

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error: any) {
    console.error("[Orders API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}