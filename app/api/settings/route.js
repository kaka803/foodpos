import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create({
        shopName: "Crispy Bites & Fast Food",
        tagline: "Fresh, Hot & Crispy Fast Food",
        address: "Shop #4, Food Street, Commercial Market",
        phone: "+92 300 1234567 / 051-5551234",
        taxRate: 10,
        currency: "Rs.",
        currencyName: "PKR",
        cashierName: "Hassan (Cashier 1)",
        invoiceFooter: "Thank you for dining with us! Please visit again.",
        orderCounter: 1001,
        receiptPaperSize: "80mm",
      });
    } else if (setting.currency === "$" || setting.currencyName === "USD" || !setting.currency) {
      // Auto-migrate any existing legacy $ currency to Rs.
      setting.currency = "Rs.";
      setting.currencyName = "PKR";
      await setting.save();
    }

    if (!setting.receiptPaperSize) {
      setting.receiptPaperSize = "80mm";
    }

    const formatted = {
      ...setting.toJSON(),
      id: setting._id.toString(),
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (body.shopName !== undefined) setting.shopName = body.shopName;
    if (body.tagline !== undefined) setting.tagline = body.tagline;
    if (body.address !== undefined) setting.address = body.address;
    if (body.phone !== undefined) setting.phone = body.phone;
    if (body.taxRate !== undefined) setting.taxRate = parseFloat(body.taxRate) || 0;
    if (body.currency !== undefined) setting.currency = body.currency;
    if (body.currencyName !== undefined) setting.currencyName = body.currencyName;
    if (body.cashierName !== undefined) setting.cashierName = body.cashierName;
    if (body.invoiceFooter !== undefined) setting.invoiceFooter = body.invoiceFooter;
    if (body.orderCounter !== undefined) setting.orderCounter = parseInt(body.orderCounter, 10) || 1001;
    if (body.receiptPaperSize !== undefined) setting.receiptPaperSize = body.receiptPaperSize;

    await setting.save();

    return NextResponse.json({ success: true, data: setting.toJSON() });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
