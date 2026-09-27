import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

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

    const sanitizedItems = (items || []).map((item) => {
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

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      {
        invoiceNumber: invoiceNumber ? invoiceNumber.trim() : undefined,
        supplierName: supplierName ? supplierName.trim() : undefined,
        supplierPhone: (supplierPhone || "").trim(),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
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
      },
      { new: true, runValidators: true }
    );

    if (!updatedPurchase) {
      return NextResponse.json(
        { success: false, error: "Purchase record not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updatedPurchase.toJSON() });
  } catch (error) {
    console.error("PUT /api/purchases/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update purchase" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await Purchase.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Purchase record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Purchase record deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/purchases/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete purchase" },
      { status: 500 }
    );
  }
}
