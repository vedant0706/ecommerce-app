import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    let token = null;

    // ✅ Check multiple sources for token
    // 1. Check cookies first (most reliable for httpOnly cookies)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.replace("Bearer ", "");
    }
    // 3. Check custom token header
    else if (req.headers.token) {
      token = req.headers.token;
    }
    // 4. Check plain Authorization header
    else if (req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    console.log("🔍 userAuth - Token found:", token ? "Yes" : "No"); // Debug

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("✅ userAuth - Token decoded:", decoded); // Debug

    // Get user from database to check role and verify existence
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user info to request
    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    req.isAdmin = user.role === "admin";
    req.user = user; // Full user object if needed

    console.log("✅ userAuth - User authenticated:", user.email); // Debug

    next();
  } catch (error) {
    console.error("❌ userAuth - Error:", error.message); // Debug
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default userAuth;