// controllers/stripePaymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from '../models/payment.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent and return the client secret.
 * Expects the request body to include "amount", "order_id", and "user_id".
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, order_id, user_id } = req.body;
    if (!amount || !order_id || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a PaymentIntent (Stripe requires the amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert dollars to cents
      currency: "usd",
    });

    // Create a Payment record in your database
    await Payment.create({
      order_id,
      user_id,
      amount,
      currency: "usd",
      status: "Pending",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

