import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

// ✅ FIXED: Cookie configuration that works everywhere
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  const options = {
    httpOnly: true,
    secure: isProduction, // true in production, false in dev
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  console.log("🍪 Cookie options:", options);
  return options;
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = getCookieOptions();
    console.log("✅ Register - Setting cookie with options:", cookieOptions);

    res.cookie("token", token, cookieOptions);

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Aura",
      text: `Welcome to Aura website, Your account has been created with email id: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ 
      success: true, 
      message: "Registration successful"
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = getCookieOptions();
    
    console.log("✅ Login successful:");
    console.log("  - User ID:", user._id);
    console.log("  - Email:", user.email);
    console.log("  - Setting cookie with options:", cookieOptions);

    // ✅ Set cookie
    res.cookie("token", token, cookieOptions);

    console.log("✅ Cookie should be set now");

    return res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    console.log("🚪 Logout - Clearing cookie");
    
    res.clearCookie("token", getCookieOptions());
    
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Send Verification OTP to the User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOption);
    res.json({ success: true, message: "Verification OTP sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify the email using OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Check if user is logged in via httpOnly cookie
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies?.token;

    console.log("🔐 Auth check:");
    console.log("  - All cookies:", Object.keys(req.cookies || {}));
    console.log("  - Token exists:", !!token);

    if (!token) {
      return res.json({ 
        success: false, 
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.json({ success: false, message: "Invalid token" });
    }

    // Fetch user to confirm they still exist
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log("✅ User authenticated:", user.email);

    return res.json({
      success: true,
      message: "Authenticated",
      userId: decoded.userId,
    });

  } catch (error) {
    console.error("❌ Auth check failed:", error.message);
    return res.json({ 
      success: false, 
      message: "Invalid or expired token"
    });
  }
};

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};