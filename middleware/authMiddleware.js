import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  console.log("Checking token");
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token:", token);
  if (!token) {
    console.log("No token provided");
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token decoded:", decoded);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token, please login again" });
    console.error("Error while decoding token", error);
  }
};
