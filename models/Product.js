import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    defaultNotes: {
      type: String,
      default: "",
      trim: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    isDeal: {
      type: Boolean,
      default: false,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        size: { type: String },
        code: { type: String },
        price: { type: Number, default: 0 },
      },
    ],
    dealItems: [
      {
        productId: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
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

// Optimize search by name and category
ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
