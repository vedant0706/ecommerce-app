import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    let token = null;

    // ------------------------------
    // 1. Check cookies (best for httpOnly cookies)
    // ------------------------------
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // ------------------------------
    // 2. Check Authorization Header (Bearer token)
    // ------------------------------
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    if (!token && authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // Extract token after "Bearer"
      } else {
        token = authHeader; // Use directly if no "Bearer"
      }
    }

    // ------------------------------
    // 3. Custom header: token
    // ------------------------------
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // ------------------------------
    // If still no token → Unauthorized
    // ------------------------------
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    // ------------------------------
    // Verify the token
    // ------------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ------------------------------
    // Check if user exists in DB
    // ------------------------------
    // const user = await userModel.findById(decoded.userId).select("-password");
    const userId = decoded.userId || decoded.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------
    // Attach user data to request
    // ------------------------------
    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    // req.isAdmin = user.role === "admin";
    req.user = user;

    // Success → continue
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default userAuth;
