import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Extract token from "Bearer TOKEN"
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user data to request
    next(); // move to next middleware/route
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired token." });
  }
};

export default authenticateToken;