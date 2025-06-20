import Order from "../models/order.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const handlePayHereNotification = async (req, res) => {
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

    // ✅ Hash the secret first (PayHere requires this format)
    const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex");

    // ✅ Construct the local signature
    const localSig = crypto
      .createHash("md5")
      .update(
        merchant_id +
        order_id +
        amount +
        currency +
        status_code +
        hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    // ✅ Compare signatures
    if (localSig !== md5sig) {
      return res.status(403).send("Invalid signature from PayHere.");
    }

    // ✅ Proceed only if payment was successful
    if (status_code === "2") {
      const extractedOrderId = order_id.replace("ORDER_", "");

      const order = await Order.findById(extractedOrderId);

      if (!order) {
        return res.status(404).send("Order not found");
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: payment_id,
        status: "Paid via PayHere",
        method,
        amount,
        currency,
      };

      await order.save();
      return res.status(200).send("Order updated as paid");
    }

    return res.status(200).send("Payment was not successful");
  } catch (error) {
    console.error("Notify Error:", error.message);
    return res.status(500).send("Server error");
  }
};
