import express from "express";
import { createCheckoutSesssion } from "../controllers/stripeController.js";
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
  .post(authorizeRoles("recruiter", "candidate"), createCheckoutSesssion);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = session.amount_total;

      if (userId && amount) {
        try {
          const tokensToAdd = amount / 50; // 1 token = $0.5, amount in cents
          await User.findByIdAndUpdate(userId, {
            $inc: { tokens: tokensToAdd },
          });

          console.log(`Added ${tokensToAdd} tokens to user ${userId}`);
        } catch (err) {
          console.error("Failed to update tokens:", err);
        }
      }
    }

    res.status(200).json({ received: true });
  }
);
export default router;
