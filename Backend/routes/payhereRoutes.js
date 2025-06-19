import express from "express";
import { handlePayHereNotification } from "../controllers/payhereController.js";

const router = express.Router();

router.post("/notify", handlePayHereNotification);

export default router;