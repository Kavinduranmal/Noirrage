// controllers/stripePaymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent and return the client secret.
 * Expects the request body to include an "amount" field.
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent (Stripe requires the amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert dollars to cents
      currency: "usd",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
