import express from 'express';
import { getUserData, isAuthenticated, adminLogin, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.get('/data', userAuth, getUserData);
authRouter.post('/admin', adminLogin);
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;