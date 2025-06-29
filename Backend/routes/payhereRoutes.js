import express from "express";
import {
  generatePayHereIntent,
  handlePayHereNotification,
} from "../controllers/payhereController.js";

const router = express.Router();

// Modern route - order created only after successful payment
router.post("/intend", generatePayHereIntent);

// PayHere notifies this endpoint on payment success
router.post("/notify", handlePayHereNotification);

export default router;
