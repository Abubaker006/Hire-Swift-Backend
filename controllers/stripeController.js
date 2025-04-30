import { configDotenv } from "dotenv";
import Stripe from "stripe";
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
      success_url: `${process.env.FRONTEND_URL}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error occured while chekcing out", error);
  }
};
