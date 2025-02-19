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

router.post("/", protect, createOrder); // Create an order
router.get("/byid", protect, getUserOrders); // Get logged-in user's orders
router.get("/all", getAllOrders); // Admin: Get all orders
router.put("/:id/ship", protect,  markOrderShipped);// Admin: Mark order as shipped
router.delete("/:id/deleted", protect, cancelOrder);// Admin: Mark order as shipped
export default router;
