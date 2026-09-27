import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: "Crispy Bites & Fast Food",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Fresh, Hot & Crispy Fast Food",
      trim: true,
    },
    address: {
      type: String,
      default: "Shop #4, Food Street, Commercial Market",
      trim: true,
    },
    phone: {
      type: String,
      default: "+92 300 1234567 / 051-5551234",
      trim: true,
    },
    taxRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    currency: {
      type: String,
      default: "Rs.",
      trim: true,
    },
    currencyName: {
      type: String,
      default: "PKR",
      trim: true,
    },
    cashierName: {
      type: String,
      default: "Hassan (Cashier 1)",
      trim: true,
    },
    invoiceFooter: {
      type: String,
      default: "Thank you for dining with us! Please visit again.",
      trim: true,
    },
    orderCounter: {
      type: Number,
      default: 1001,
    },
    receiptPaperSize: {
      type: String,
      default: "80mm",
      enum: ["80mm", "58mm"],
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

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
