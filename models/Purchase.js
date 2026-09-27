import mongoose from "mongoose";

const PurchaseItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, default: "Grocery", trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, default: "kg", trim: true }, // kg, ltr, pcs, packs, crates, boxes, bags
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PurchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    supplierPhone: {
      type: String,
      default: "",
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    items: [PurchaseItemSchema],
    totalItemsCount: {
      type: Number,
      default: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "paid",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "Credit", "Online"],
      default: "Cash",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

PurchaseSchema.index({ createdAt: -1 });

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
