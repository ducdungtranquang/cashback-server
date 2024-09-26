import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getUserProfile,
  resetPassword,
  updateUserProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.get("/", protect, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
