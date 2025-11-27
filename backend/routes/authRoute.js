import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
// Test endpoint - ADD THIS
authRouter.get('/test-cookie', (req, res) => {
  res.cookie('test', 'value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60000,
    path: "/"
  });
  
  res.json({ 
    success: true, 
    message: "Test cookie set",
    cookies: req.cookies
  });
});


export default authRouter;