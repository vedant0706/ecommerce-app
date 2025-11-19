import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    try {
        // ✅ FIXED: Check multiple sources for token
        let token = null;
        
        // 1. Check Authorization header with Bearer
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(" ")[1];
        }
        // 2. Check custom 'token' header
        else if (req.headers.token) {
            token = req.headers.token;
        }
        // 3. Check cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        console.log("🔍 Auth Middleware - Received Token:", token ? "Token exists" : "No token");

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized. Login required." 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log("✅ Token Decoded:", decoded);

        // ✅ CRITICAL FIX: Check which property exists in decoded token
        // Your authController uses 'userId', userController uses 'id'
        if (decoded.userId) {
            req.body.userId = decoded.userId;
        } else if (decoded.id) {
            req.body.userId = decoded.id;
        } else {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token format" 
            });
        }

        console.log("✅ User ID set in req.body:", req.body.userId);
        next();
        
    } catch (error) {
        console.log("❌ Auth Middleware Error:", error.message);
        return res.status(401).json({ 
            success: false, 
            message: "Invalid or expired token" 
        });
    }
};

export default authUser;