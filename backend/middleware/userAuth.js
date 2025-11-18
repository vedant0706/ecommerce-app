import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    // Check for token in both cookies and headers (for flexibility)
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default userAuth;
