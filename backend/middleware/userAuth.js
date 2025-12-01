import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.token) {
      token = req.cookies.token;
    }

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

    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format - missing user ID",
      });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    req.user = user;

    req.body = req.body || {};
    req.body.userId = user._id;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default userAuth;
