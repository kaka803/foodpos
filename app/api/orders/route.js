import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Setting from "@/models/Setting";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const formatted = orders.map((o) => ({
      ...o,
      id: o._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      orderType,
      tableNumber,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      total,
      paymentMethod,
      amountPaid,
      changeDue,
      cashier,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Atomically find or create settings to get & increment orderCounter
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ orderCounter: 1001 });
    }

    const nextNumber = setting.orderCounter || 1001;
    const formattedOrderNumber = `#${nextNumber}`;

    // Increment setting counter for next order
    setting.orderCounter = nextNumber + 1;
    await setting.save();

    const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const newOrder = await Order.create({
      orderNumber: formattedOrderNumber,
      customerName: (customerName || "Walk-in Customer").trim(),
      customerPhone: (customerPhone || "").trim(),
      orderType: orderType || "dine_in",
      tableNumber: tableNumber || "-",
      items: items.map((it) => ({
        id: it.id || it.productId || "",
        name: it.name,
        price: parseFloat(it.price) || 0,
        quantity: parseInt(it.quantity, 10) || 1,
        notes: it.notes || "",
        image: it.image || "",
      })),
      itemsCount: totalItemsCount,
      subtotal: parseFloat(subtotal) || 0,
      taxRate: parseFloat(taxRate) || 0,
      taxAmount: parseFloat(taxAmount) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      total: parseFloat(total) || 0,
      paymentMethod: paymentMethod || "Cash",
      amountPaid: parseFloat(amountPaid) || parseFloat(total) || 0,
      changeDue: parseFloat(changeDue) || 0,
      status: "completed",
      cashier: (cashier || setting.cashierName || "Cashier 1").trim(),
      timestamp: new Date(),
    });

    // Efficiently increment salesCount for ordered items in parallel
    const productUpdates = items
      .filter((it) => it.productId && mongoose.Types.ObjectId.isValid(it.productId))
      .map((it) =>
        Product.findByIdAndUpdate(it.productId, {
          $inc: { salesCount: it.quantity || 1 },
        })
      );

    if (productUpdates.length > 0) {
      await Promise.allSettled(productUpdates);
    }

    return NextResponse.json(
      { success: true, data: newOrder.toJSON(), nextOrderNumber: nextNumber + 1 },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
