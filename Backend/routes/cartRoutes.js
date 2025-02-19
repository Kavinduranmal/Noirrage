import express from "express";
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart); // Add item to cart
router.delete("/remove/:itemId", protect,removeFromCart);
router.get("/view", protect, getCart); // View user's cart

export default router;
