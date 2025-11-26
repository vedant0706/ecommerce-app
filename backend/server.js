import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

// Database & External Services
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Route Imports
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// App Configuration
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ MIDDLEWARE SETUP - ORDER MATTERS!
// 1. Cookie Parser FIRST
app.use(cookieParser());

// 2. CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://aura-ecommerce-app.vercel.app",
  "https://admin-aura-ecommerce-app.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ CRITICAL: Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request Logging (Development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log("Cookies:", req.cookies);
    next();
  });
}

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is Working",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// 404 Handler - Catch Undefined Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Database & Server Startup
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Database connected successfully");

    // Connect to Cloudinary
    await connectCloudinary();
    console.log("✅ Cloudinary connected successfully");

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔐 JWT Secret configured: ${!!process.env.JWT_SECRET}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;