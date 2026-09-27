import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      default: "Walk-in Customer",
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["dine_in", "take_away", "delivery"],
      default: "dine_in",
    },
    tableNumber: {
      type: String,
      default: "-",
    },
    items: [OrderItemSchema],
    itemsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Cash",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    changeDue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "held"],
      default: "completed",
    },
    cashier: {
      type: String,
      default: "Cashier 1",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
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

// Optimize order query indexes for fast sorting
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
