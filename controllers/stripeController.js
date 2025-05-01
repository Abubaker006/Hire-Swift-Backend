import { configDotenv } from "dotenv";
import Stripe from "stripe";
import User from "../models/User.js";
configDotenv();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//@ROUTE - POST api/v1/stripe/create-checkout-session
export const createCheckoutSesssion = async (req, res) => {
  const { amount } = req.body;

  const userId = req.user?.id;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Test Product" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { userId },
      success_url: `${process.env.FRONTEND_URL}/success?amount=${amount}&userId=${userId}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error occured while chekcing out", error);
  }
};

//@ROUTE - POST /api/v1/stripe/update-tokens
export const addTokens = async (req, res) => {
  const { amount, userId } = req.body;
  if (!amount || !userId)
    return res.status(400).json({ message: "Missing data" });

  const tokensToAdd = (amount / 100) * 2;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(userId, { $inc: { tokens: tokensToAdd } });
    return res.status(200).json({ message: "Tokens updated successfully." });
  } catch (error) {
    console.error("Error at adding tokens", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
