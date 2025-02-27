import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  markOrderShipped,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createOrder); // Create an order from cart items
router.get("/byid", protect, getUserOrders); // Get logged-in user's orders
router.get("/all",  getAllOrders); // Admin: Get all orders (added protect for security)
router.put("/:id/ship", protect, markOrderShipped); // Admin: Mark order as shipped
router.delete("/:id/cancel", protect, cancelOrder); // User/Admin: Cancel order

export default router;
