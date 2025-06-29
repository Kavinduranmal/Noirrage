import express from "express";
import { createPayHereForm, handlePayHereNotification } from "../controllers/payhereController.js";

const router = express.Router();

router.get("/form/:orderId", createPayHereForm);     // PayHere Form
router.post("/notify", handlePayHereNotification);   // Payment Status Callback

export default router;
