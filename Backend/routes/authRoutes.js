import express from "express";
import {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
} from "../controllers/authController.js";
import { getUserProfile, updateUserProfile } from "../controllers/UserprofileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

router.get("/profileview", protect, getUserProfile);
router.put("/profiledit",protect,  updateUserProfile);

export default router;
