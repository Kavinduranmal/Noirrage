import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Shipped"], default: "Pending" },
    shippingDetails: {
      email: { type: String, required: true },
      address: { type: String, required: true },
      contactNumber: { type: String, required: true },
    },
    shippedAt: { type: Date },

    // 🚀 Add these for PayHere support
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      method: { type: String },
      amount: { type: String },
      currency: { type: String },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
