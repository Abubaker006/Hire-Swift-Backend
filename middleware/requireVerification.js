import User from "../models/User.js";

export const requireVerifiedRecruiter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.role !== "recruiter") {
      return next();
    }
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message:
    //       "Recruiter account is under verification. You cannot perform this action.",
    //   });
    // }
     return next();
  } catch (error) {
    console.error("Error in requireVerifiedRecruiter middleware:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};
