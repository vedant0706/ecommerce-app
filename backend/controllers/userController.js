import validator from "validator";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ✅ FIX: Use userId consistently
const createToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET); // Changed from { id } to { userId }
};

// getUsrData
const getUserData = async (req, res) => {
  try {
    // ✅ The user object is already attached by userAuth middleware
    const user = req.user; // Use req.user instead of fetching again
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role, // Include role if it exists in your user model
      }
    });
    
  } catch (error) {
    console.error("❌ getUserData Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: error.message
    });
  }
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //checking user alreday exiss or not.
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User alredy exists" });
    }
    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false, // ✅ Fixed: was true, should be false
        message: "Please enter a strong password",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({success: true, token})
        } else{
            res.json({success: false, message: "Invalid Credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getUserData, loginUser, registerUser, adminLogin };