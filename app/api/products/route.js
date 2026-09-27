import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, category, price, image, description, defaultNotes, isDeal, dealItems, hasVariants, variants } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const cat = (category || "pizza").toLowerCase().trim();

    const newProduct = await Product.create({
      name: name.trim(),
      category: cat,
      price: parseFloat(price) || 0,
      image: image || "",
      description: (description || "").trim(),
      defaultNotes: (defaultNotes || "").trim(),
      isDeal: isDeal || cat === "deals",
      dealItems: Array.isArray(dealItems) ? dealItems : [],
      hasVariants: Boolean(hasVariants),
      variants: Array.isArray(variants) ? variants : [],
      salesCount: 0,
      rating: 5.0,
    });

    return NextResponse.json(
      { success: true, data: newProduct.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
