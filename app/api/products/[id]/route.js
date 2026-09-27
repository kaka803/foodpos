import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) {
      updateData.category = body.category.toLowerCase().trim();
      if (updateData.category === "deals") {
        updateData.isDeal = true;
      }
    }
    if (body.price !== undefined) updateData.price = parseFloat(body.price) || 0;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.defaultNotes !== undefined) updateData.defaultNotes = body.defaultNotes.trim();
    if (body.isDeal !== undefined) updateData.isDeal = Boolean(body.isDeal);
    if (body.dealItems !== undefined) updateData.dealItems = Array.isArray(body.dealItems) ? body.dealItems : [];
    if (body.hasVariants !== undefined) updateData.hasVariants = Boolean(body.hasVariants);
    if (body.variants !== undefined) updateData.variants = Array.isArray(body.variants) ? body.variants : [];

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProduct.toJSON() });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
