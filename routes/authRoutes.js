import express from "express";
import {
  signup,
  login,
  logout,
  getUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/user", protect, getUser);

export default router;
