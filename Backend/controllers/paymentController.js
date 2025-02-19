// controllers/paymentController.js
import crypto from 'crypto';
import Payment from '../models/payment.js';  // Updated model name

const MERCHANT_ID = "YOUR_MERCHANT_ID";
const MERCHANT_SECRET = "YOUR_MERCHANT_SECRET";
const CURRENCY = "LKR";

// Function to generate payment data
export const initiatePayment = async (req, res) => {
    try {
        const { order_id, amount, email, first_name, last_name, phone } = req.body;

        // Generate hash for security
        const hash = crypto.createHash("md5").update(
            MERCHANT_ID + order_id + amount + CURRENCY + MERCHANT_SECRET
        ).digest("hex").toUpperCase();

        // Save order details to the database with the updated model name
        const newPayment = new Payment({
            order_id,
            user_id: req.user._id,  // Assuming the user is authenticated and the user object is in req.user
            amount,
            currency: CURRENCY,
        });
        await newPayment.save();

        // Prepare payment request data
        const paymentData = {
            merchant_id: MERCHANT_ID,
            order_id,
            amount,
            currency: CURRENCY,
            email,
            first_name,
            last_name,
            phone,
            hash,
            return_url: "https://linukaportfolio.netlify.app/payment-success",
            cancel_url: "https://linukaportfolio.netlify.app/payment-failed",
            notify_url: "https://yourbackend.com/api/payhere/notify",
        };

        res.status(200).json({ success: true, paymentData });

    } catch (error) {
        res.status(500).json({ success: false, message: "Payment initiation failed", error: error.message });
    }
};

// Handle PayHere notifications
export const handlePaymentNotification = async (req, res) => {
    try {
        console.log("PayHere Notification Received:", req.body);

        const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

        // Verify payment using PayHere secret key
        const generatedMd5sig = crypto.createHash("md5").update(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + MERCHANT_SECRET
        ).digest("hex").toUpperCase();

        if (generatedMd5sig !== md5sig) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Find the payment and update its status if payment is successful
        if (status_code === "2") {
            const payment = await Payment.findOne({ order_id });
            if (payment) {
                payment.status = "Paid";
                payment.updated_at = Date.now();
                await payment.save();
                console.log(`Payment for Order ${order_id} was successful!`);
            }
        }

        res.status(200).json({ success: true, message: "Notification processed" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Notification handling failed", error: error.message });
    }
};
