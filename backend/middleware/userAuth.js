import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

/**
 * Universal Authentication Middleware
 */
const userAuth = async (req, res, next) => {
  try {
    let token = null;

    // --------------------------------------
    // 1. Check cookies
    // --------------------------------------
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // --------------------------------------
    // 2. Authorization header (Bearer token)
    // --------------------------------------
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        } else {
          token = authHeader;
        }
      }
    }

    // --------------------------------------
    // 3. Custom header: token
    // --------------------------------------
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // --------------------------------------
    // No token → Unauthorized
    // --------------------------------------
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    // --------------------------------------
    // Verify token
    // --------------------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✓ Token Decoded Successfully:", decoded);
    } catch (err) {
      console.log("✗ Token Verification Failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // --------------------------------------
    // Extract userId
    // --------------------------------------
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format - missing user ID",
      });
    }

    // --------------------------------------
    // Check DB for user
    // --------------------------------------
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------
    // Attach user data safely
    // --------------------------------------
    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    req.user = user;

    // SAFE FIX → Prevent crash on GET requests
    req.body = req.body || {};
    req.body.userId = user._id;

    console.log("✓ Authentication Successful - User ID:", user._id);

    next();

  } catch (error) {
    console.error("✗ Authentication Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default userAuth;
