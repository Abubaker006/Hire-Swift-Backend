import express from "express";
import {
  signup,
  login,
  logout,
  getUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-refresh-token", verifyResetToken);
router.post("/reset-password", resetPassword);
router.get("/user", protect, getUser);

export default router;
