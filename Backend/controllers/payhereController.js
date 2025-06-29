import Order from "../models/order.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { generatePayHereHash } from "../utils/generatePayHereHash.js";

dotenv.config();

// 🎯 STEP 1: Create the PayHere Payment Form
export const createPayHereForm = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).send("Order not found");

    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_SECRET;
    const amount = parseFloat(order.totalPrice).toFixed(2);
    const currency = "LKR";
    const orderRef = `ORDER_${order._id}`;

    const hash = generatePayHereHash({
      merchant_id,
      order_id: orderRef,
      amount,
      currency,
      merchant_secret,
    });

    const payHereURL =
      process.env.PAYHERE_MODE === "live"
        ? "https://www.payhere.lk/pay/checkout"
        : "https://sandbox.payhere.lk/pay/checkout";

    const formHtml = `
      <html>
        <body onload="document.forms[0].submit()">
          <form method="post" action="${payHereURL}">
            <input type="hidden" name="merchant_id" value="${merchant_id}">
            <input type="hidden" name="return_url" value="https://yourdomain.com/payment-success">
            <input type="hidden" name="cancel_url" value="https://yourdomain.com/payment-cancel">
            <input type="hidden" name="notify_url" value="https://yourdomain.com/api/payhere/notify">

            <input type="hidden" name="order_id" value="${orderRef}">
            <input type="hidden" name="items" value="Order ${orderRef}">
            <input type="hidden" name="currency" value="${currency}">
            <input type="hidden" name="amount" value="${amount}">

            <input type="hidden" name="first_name" value="Customer">
            <input type="hidden" name="last_name" value="Name">
            <input type="hidden" name="email" value="${order.shippingDetails.email}">
            <input type="hidden" name="phone" value="${order.shippingDetails.contactNumber}">
            <input type="hidden" name="address" value="${order.shippingDetails.address}">
            <input type="hidden" name="city" value="Colombo">
            <input type="hidden" name="country" value="Sri Lanka">

            <input type="hidden" name="hash" value="${hash}">
            <button type="submit">Proceed to PayHere</button>
          </form>
        </body>
      </html>
    `;

    res.send(formHtml);
  } catch (error) {
    console.error("❌ Error generating PayHere form:", error.message);
    res.status(500).send("Failed to create payment form");
  }
};

// 🎯 STEP 2: Handle PayHere Callback Notification
export const handlePayHereNotification = async (req, res) => {
  console.log("🔥 PayHere Callback Received:");
  console.log(req.body);

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

    console.log("🔐 Local Signature  :", localSig);
    console.log("🔐 PayHere Signature:", md5sig);

    if (localSig !== md5sig) {
      return res.status(403).send("Invalid signature from PayHere.");
    }

    if (status_code === "2") {
      const extractedOrderId = order_id.replace("ORDER_", "");
      const order = await Order.findById(extractedOrderId);

      if (!order) return res.status(404).send("Order not found");

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: payment_id,
        status: "Paid via PayHere",
        method,
        amount: amountFormatted,
        currency,
      };

      await order.save();
      return res.status(200).send("Order updated as paid");
    }

    return res.status(200).send("Payment was not successful");
  } catch (error) {
    console.error("❌ Notify Error:", error.message);
    return res.status(500).send("Server error");
  }
};
