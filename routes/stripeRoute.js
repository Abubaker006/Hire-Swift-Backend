import express from "express";
import {
  createCheckoutSesssion,
  addTokens,
} from "../controllers/stripeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import Stripe from "stripe";
import { configDotenv } from "dotenv";
configDotenv();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.use(protect);

router
  .route("/create-checkout-session")
  .post(authorizeRoles("candidate"), createCheckoutSesssion);

router.post("/update-tokens", addTokens);

export default router;
