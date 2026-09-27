import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Purchase from "@/models/Purchase";

export async function GET() {
  try {
    await connectToDatabase();
    const purchases = await Purchase.find({})
      .sort({ purchaseDate: -1, createdAt: -1 })
      .limit(300)
      .lean();

    const formatted = purchases.map((p) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      invoiceNumber,
      supplierName,
      supplierPhone,
      purchaseDate,
      items,
      discountAmount = 0,
      paidAmount = 0,
      paymentMethod = "Cash",
      notes = "",
    } = body;

    if (!supplierName || !supplierName.trim()) {
      return NextResponse.json(
        { success: false, error: "Supplier name is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please add at least one stock item" },
        { status: 400 }
      );
    }

    // Sanitize and calculate items
    const sanitizedItems = items.map((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unitCost) || 0;
      const totalCost = parseFloat((qty * unitCost).toFixed(2));
      return {
        itemName: (item.itemName || "").trim(),
        category: (item.category || "Grocery").trim(),
        quantity: qty,
        unit: (item.unit || "kg").trim(),
        unitCost: unitCost,
        totalCost: totalCost,
      };
    }).filter(it => it.itemName && it.quantity > 0);

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stock items must have a valid name and quantity" },
        { status: 400 }
      );
    }

    const subtotal = parseFloat(
      sanitizedItems.reduce((sum, it) => sum + it.totalCost, 0).toFixed(2)
    );
    const discount = Math.max(0, parseFloat(discountAmount) || 0);
    const grandTotal = Math.max(0, parseFloat((subtotal - discount).toFixed(2)));
    const paid = Math.max(0, parseFloat(paidAmount) || 0);
    const balanceDue = Math.max(0, parseFloat((grandTotal - paid).toFixed(2)));

    let paymentStatus = "paid";
    if (paid === 0 && grandTotal > 0) {
      paymentStatus = "unpaid";
    } else if (paid < grandTotal) {
      paymentStatus = "partial";
    }

    // Generate invoice number if not provided
    const invNo = invoiceNumber && invoiceNumber.trim()
      ? invoiceNumber.trim()
      : `BILL-${Date.now().toString().slice(-6)}`;

    const newPurchase = await Purchase.create({
      invoiceNumber: invNo,
      supplierName: supplierName.trim(),
      supplierPhone: (supplierPhone || "").trim(),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      items: sanitizedItems,
      totalItemsCount: sanitizedItems.length,
      subtotal,
      discountAmount: discount,
      grandTotal,
      paidAmount: paid,
      balanceDue,
      paymentStatus,
      paymentMethod,
      notes: (notes || "").trim(),
    });

    return NextResponse.json(
      { success: true, data: newPurchase.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/purchases error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create purchase entry" },
      { status: 500 }
    );
  }
}
