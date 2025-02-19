import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  markProductOutOfStock,
  markProductRestored,
} from "../controllers/productController.js";
import { upload } from "../middleware/uploadMiddleware.js"; // ✅ Fix import

const router = express.Router();

// ✅ Allow multiple image uploads (Change `single` to `array`)
router.post("/add", upload.array("images", 5), addProduct); // Admin: Add product with multiple images
router.get("/", getProducts); // Users: Get all products
router.get("/:id", getProductById); // Users: Get single product
router.put("/:id", upload.array("images", 5), updateProduct); // Admin: Update product (multiple images support)
router.delete("/:id", deleteProduct); // Admin: Delete product
router.put("/:id/out-of-stock", markProductOutOfStock);
router.put("/:id/restored", markProductRestored);

export default router;
