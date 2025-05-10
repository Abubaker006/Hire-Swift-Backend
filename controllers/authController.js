import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import { sendResetEmail } from "../utils/SendEmail.js";
import crypto from "node:crypto";

// @route POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber, role } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !contactNumber ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      role,
    });

    const token = generateToken(user, "1d");
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in signup", error);
  }
};

// @route POST /api/auth/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user, "1d");
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in login", error);
  }
};

// @route GET /api/auth/logout
export const logout = (req, res) => {
  try {
    console.log("User Logging Out...");

    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = await req.user.id;
    const userRole = await req.user.role;
    const user = await User.findById(userId).select("-password");

    if (user.role !== userRole) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User found", user });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "Please provide valid email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetLink = `${process.env.FRONTEND_HOME_URL}/forgot-password/reset-password?token=${resetToken}&email=${email}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Error at forgot password", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ message: "Invalid parameters." });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(404).json({ message: "Unauthorized access." });
    }
    const storedPasswordResetToken = user.passwordResetToken;
    if(!storedPasswordResetToken || !hashedToken){
      return res.status(500).json({message:"Internl Server Error"})
    }
    const inputBuffer = Buffer.from(hashedToken, "hex");
    const storedBuffer = Buffer.from(storedPasswordResetToken, "hex");

    const isMatch = crypto.timingSafeEqual(inputBuffer, storedBuffer);

    if (isMatch) {
      res.json({ message: "Token Verified", canContinue: true });
    } else {
      res.status(401).json({ message: "Invalid token", canContinue: false });
    }
  } catch (error) {
    console.error("Reset Token Verification Error:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email) {
      return res.status(400).json({ message: "Invalid parameters." });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};
