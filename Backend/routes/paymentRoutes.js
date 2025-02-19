// routes/paymentRoutes.js
import express from 'express';
import { initiatePayment, handlePaymentNotification } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';  // Assuming only authenticated users can make payments

const router = express.Router();

// Route to initiate a payment (User must be logged in)
router.post("/payhere/payment", protect, initiatePayment);

// Route to handle PayHere notifications
router.post("/payhere/notify", handlePaymentNotification);

export default router;
