import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/useRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import authRouter from "./routes/authRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://aura-ecommerce-sandy.vercel.app", "https://aura-ecommerce-backend-seven.vercel.app", "https://aura-ecommerce-admin.vercel.app"],
    credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    exposedHeaders: ["Content-Type", "Authorization", "token"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// API Endpoints
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API is working");
});

app.listen(port, () => console.log("Server started on PORT: " + port));
