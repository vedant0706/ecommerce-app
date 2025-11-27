// import jwt from "jsonwebtoken";
// import userModel from "../models/userModel.js";

// /**
//  * Universal Authentication Middleware
//  * Combines token verification from multiple sources and user validation
//  */
// const userAuth = async (req, res, next) => {
//   try {
//     let token = null;

//     // ------------------------------
//     // 1. Check cookies (best for httpOnly cookies)
//     // ------------------------------
//     if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     // ------------------------------
//     // 2. Check Authorization Header (Bearer token)
//     // ------------------------------
//     if (!token) {
//       const authHeader = req.headers.authorization || req.headers.Authorization;
      
//       if (authHeader) {
//         if (authHeader.startsWith("Bearer ")) {
//           token = authHeader.split(" ")[1]; // Extract token after "Bearer"
//         } else {
//           token = authHeader; // Use directly if no "Bearer"
//         }
//       }
//     }

//     // ------------------------------
//     // 3. Custom header: token
//     // ------------------------------
//     if (!token && req.headers.token) {
//       token = req.headers.token;
//     }

//     // ------------------------------
//     // If still no token → Unauthorized
//     // ------------------------------
//     if (!token || token === "null" || token === "undefined") {
//       return res.status(401).json({
//         success: false,
//         message: "Not authorized. Please login.",
//       });
//     }

//     // ------------------------------
//     // Verify the token
//     // ------------------------------
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("✅ Token Decoded Successfully:", decoded);
//     } catch (err) {
//       console.log("❌ Token Verification Failed:", err.message);
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or expired token",
//       });
//     }

//     // ------------------------------
//     // Extract userId (handle both formats)
//     // ------------------------------
//     const userId = decoded.userId || decoded.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token format - missing user ID",
//       });
//     }

//     // ------------------------------
//     // Check if user exists in DB
//     // ------------------------------
//     const user = await userModel.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // ------------------------------
//     // Attach user data to request (multiple formats for compatibility)
//     // ------------------------------
//     req.userId = user._id;           // For routes expecting req.userId
//     req.userEmail = user.email;
//     req.userName = user.name;
//     req.user = user;                 // Full user object
    
//     // Also attach to req.body for legacy compatibility
//     req.body.userId = user._id;

//     console.log("✅ Authentication Successful - User ID:", user._id);

//     // Success → continue to next middleware/route
//     next();
    
//   } catch (error) {
//     console.error("❌ Authentication Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Authentication error",
//     });
//   }
// };

// export default userAuth;

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

/**
 * Universal Authentication Middleware
 * Handles authentication from cookies, headers, and custom tokens
 */
const userAuth = async (req, res, next) => {
  try {
    let token = null;

    console.log("\n🔐 === AUTH MIDDLEWARE START ===");
    console.log("📍 Route:", req.method, req.path);

    // ------------------------------
    // 1. Check cookies (best for httpOnly cookies)
    // ------------------------------
    if (req.cookies?.token) {
      token = req.cookies.token;
      console.log("✅ Token found in cookies");
    }

    // ------------------------------
    // 2. Check Authorization Header (Bearer token)
    // ------------------------------
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      
      if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
          console.log("✅ Token found in Bearer header");
        } else {
          token = authHeader;
          console.log("✅ Token found in auth header");
        }
      }
    }

    // ------------------------------
    // 3. Custom header: token
    // ------------------------------
    if (!token && req.headers.token) {
      token = req.headers.token;
      console.log("✅ Token found in custom header");
    }

    // ------------------------------
    // If no token found → Unauthorized
    // ------------------------------
    if (!token || token === "null" || token === "undefined") {
      console.log("❌ No valid token provided");
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    console.log("🔑 Token:", token.substring(0, 30) + "...");

    // ------------------------------
    // Verify the JWT token
    // ------------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified successfully");
      console.log("📦 Decoded payload:", decoded);
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: err.message,
      });
    }

    // ------------------------------
    // Extract userId (handle both formats)
    // ------------------------------
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      console.log("❌ No userId found in token payload");
      return res.status(401).json({
        success: false,
        message: "Invalid token format - missing user ID",
      });
    }

    console.log("🔍 Looking up user ID:", userId);

    // ------------------------------
    // Fetch user from database
    // ------------------------------
    let user;
    try {
      user = await userModel.findById(userId).select("-password");
      
      if (!user) {
        console.log("❌ User not found in database");
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      
      console.log("✅ User found:", user.email);
      
    } catch (dbError) {
      console.error("❌ Database error:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching user",
        error: dbError.message,
      });
    }

    // ------------------------------
    // Attach user data to request object
    // ------------------------------
    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    req.user = user; // Full user object (without password)
    
    // Legacy compatibility
    req.body.userId = user._id.toString();

    console.log("✅ Auth successful - User:", user.email);
    console.log("🔐 === AUTH MIDDLEWARE END ===\n");

    // Continue to next middleware/route
    next();
    
  } catch (error) {
    console.error("\n❌ === AUTH MIDDLEWARE ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("❌ === END ERROR ===\n");
    
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

export default userAuth;