import Order from "../models/order.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { generatePayHereHash } from "../utils/generatePayHereHash.js";
import Product from "../models/product.js";

dotenv.config();

// 🎯 STEP 1: Generate PayHere Payment Intent (returns hash)
export const generatePayHereIntent = async (req, res) => {
  try {
    const {
      product,
      quantity,
      size,
      color,
      totalPrice,
      shippingDetails,
    } = req.body;

    if (!product || !quantity || !totalPrice || !shippingDetails?.email) {
      return res.status(400).send("Missing required payment data");
    }

    const orderId = crypto.randomUUID(); // TEMPORARY ID (not saved yet)
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_SECRET;
    const currency = "LKR";

    const hash = generatePayHereHash({
      merchant_id,
      order_id: `ORDER_${orderId}`,
      amount: parseFloat(totalPrice).toFixed(2),
      currency,
      merchant_secret,
    });

    const payment = {
      merchant_id,
      return_url: "https://noirrage.com/payment-success",
      cancel_url: "https://noirrage.com/payment-cancel",
      notify_url: "https://noirrage.com/api/payhere/notify",
      first_name: "Noirrage",
      last_name: "Customer",
      email: shippingDetails.email,
      phone: shippingDetails.contactNumber,
      address: shippingDetails.addressLine1,
      city: shippingDetails.addressLine3 || "Colombo",
      country: "Sri Lanka",
      order_id: `ORDER_${orderId}`,
      items: `Product: ${product}`,
      currency,
      amount: parseFloat(totalPrice).toFixed(2),
      hash,
      custom_1: JSON.stringify({ product, quantity, size, color, shippingDetails }),
    };

    res.json({ payment });
  } catch (error) {
    console.error("❌ Error in generatePayHereIntent:", error.message);
    res.status(500).send("Failed to generate PayHere payment intent");
  }
};

// 🎯 STEP 2: Handle PayHere Notification and Create Order
export const handlePayHereNotification = async (req, res) => {
  console.log("🔥 PayHere Callback Received:", req.body);

  try {
    const {
      merchant_id,
      order_id,
      amount,
      currency,
      status_code,
      md5sig,
      payment_id,
      method,
      custom_1,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_SECRET;
    const amountFormatted = parseFloat(amount).toFixed(2);

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localSig = crypto
      .createHash("md5")
      .update(
        merchant_id +
        order_id +
        amountFormatted +
        currency +
        status_code +
        hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    console.log("🔐 Local Signature:", localSig);
    console.log("🔐 PayHere Signature:", md5sig);

    if (localSig !== md5sig) {
      return res.status(403).send("Invalid signature from PayHere.");
    }

    if (status_code === "2") {
      // Extract and parse order data from custom_1
      const orderMeta = JSON.parse(custom_1 || "{}");
      const { product, quantity, size, color, shippingDetails } = orderMeta;

      if (!product || !shippingDetails?.email) {
        return res.status(400).send("Missing order info in callback");
      }

      const fetchedProduct = await Product.findById(product);
      if (!fetchedProduct) return res.status(404).send("Product not found");

      const order = new Order({
        products: [{ product, quantity, size, color }],
        totalPrice: amountFormatted,
        shippingDetails: {
          email: shippingDetails.email,
          address: shippingDetails.addressLine1, // or full address string
          contactNumber: shippingDetails.contactNumber,
        },
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: payment_id,
          status: "Paid via PayHere",
          method,
          amount: amountFormatted,
          currency,
        },
      });

      await order.save();
      return res.status(200).send("✅ Order created and marked as paid");
    }

    return res.status(200).send("Payment not completed");
  } catch (error) {
    console.error("❌ Notify Error:", error.message);
    return res.status(500).send("Server error");
  }
};
