import Order from "../models/order.js";
import dotenv from "dotenv";
dotenv.config();


export const handlePayHereNotification = async (req, res) => {
  const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_SECRET;

  try {
    const {
      order_id,
      status_code,
      payhere_amount,
      payhere_currency,
      payment_id,
      method,
    } = req.body;

    // console.log("✅ PayHere IPN received:", req.body);

    // Only continue if payment is successful
    if (status_code === "2") {
      const extractedOrderId = order_id.replace("ORDER_", "");

      const order = await Order.findById(extractedOrderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update order payment status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: payment_id,
        status: "Paid via PayHere",
        method,
        amount: payhere_amount,
        currency: payhere_currency,
      };

      await order.save();
      return res.status(200).send("Order marked as paid");
    }

    // If not successful
    res.status(200).send("Payment not completed");
  } catch (err) {
    // console.error("❌ PayHere notify error:", err.message);
    res.status(500).send("Internal server error");
  }
};
