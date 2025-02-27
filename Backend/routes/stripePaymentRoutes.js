import express from "express";
import { createPaymentIntent } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/stripe/create-payment-intent", protect, createPaymentIntent);

export default router;