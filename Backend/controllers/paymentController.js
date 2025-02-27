import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/payment.js";
import Order from "../models/order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findById(orderId).populate("products.product");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const totalAmount = order.totalPrice;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents (assuming LKR)
      currency: "lkr",
    });

    await Payment.create({
      order_id: orderId,
      user_id: req.user._id,
      amount: totalAmount,
      currency: "lkr",
      status: "Pending",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};