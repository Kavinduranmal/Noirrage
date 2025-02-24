// routes/stripePaymentRoutes.js
import express from "express";
import { createPaymentIntent } from "../controllers/paymentController.js";

const router = express.Router();

// POST /api/stripe/create-payment-intent
router.post("/stripe/create-payment-intent", createPaymentIntent);

export default router;
