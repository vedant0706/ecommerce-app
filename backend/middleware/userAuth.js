import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

/**
 * Universal Authentication Middleware
 * Combines token verification from multiple sources and user validation
 */
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
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      
      if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1]; // Extract token after "Bearer"
        } else {
          token = authHeader; // Use directly if no "Bearer"
        }
      }
    }

    // ------------------------------
    // 3. Custom header: token
    // ------------------------------
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // ------------------------------
    // If still no token â†’ Unauthorized
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
      console.log("âœ… Token Decoded Successfully:", decoded);
    } catch (err) {
      console.log("âŒ Token Verification Failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ------------------------------
    // Extract userId (handle both formats)
    // ------------------------------
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format - missing user ID",
      });
    }

    // ------------------------------
    // Check if user exists in DB
    // ------------------------------
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------
    // Attach user data to request (multiple formats for compatibility)
    // ------------------------------
    req.userId = user._id;           // For routes expecting req.userId
    req.userEmail = user.email;
    req.userName = user.name;
    req.user = user;                 // Full user object
    
    // Also attach to req.body for legacy compatibility
    req.body.userId = user._id;

    console.log("âœ… Authentication Successful - User ID:", user._id);

    // Success â†’ continue to next middleware/route
    next();
    
  } catch (error) {
    console.error("âŒ Authentication Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default userAuth;