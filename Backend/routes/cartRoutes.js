import express from "express";
import { addToCart, getCart, removeCartItem } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart); // Add item to cart
router.get("/view", protect, getCart); // Get user's cart
router.delete("/remove/:itemId", protect, removeCartItem); // Remove item from cart

export default router;