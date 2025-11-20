// import jwt from "jsonwebtoken";

// const authUser = async (req, res, next) => {
//     try {
//         let token = null;
        
//         // ✅ Check multiple sources for token
//         // 1. Check cookies first (most reliable for httpOnly cookies)
//         if (req.cookies && req.cookies.token) {
//             token = req.cookies.token;
//         }
//         // 2. Check Authorization header with Bearer
//         else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//             token = req.headers.authorization.split(" ")[1];
//         }
//         // 3. Check custom 'token' header
//         else if (req.headers.token) {
//             token = req.headers.token;
//         }

//         console.log("🔍 authUser Middleware - Token found:", token ? "Yes" : "No");

//         if (!token) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "Not Authorized. Login required." 
//             });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         console.log("✅ authUser - Token Decoded:", decoded);

//         // ✅ CRITICAL FIX: authController uses 'userId', userController uses 'id'
//         // Check which property exists in decoded token
//         if (decoded.userId) {
//             req.body.userId = decoded.userId;
//         } else if (decoded.id) {
//             req.body.userId = decoded.id;
//         } else {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "Invalid token format" 
//             });
//         }

//         console.log("✅ authUser - User ID set in req.body:", req.body.userId);
//         next();
        
//     } catch (error) {
//         console.log("❌ authUser Middleware Error:", error.message);
//         return res.status(401).json({ 
//             success: false, 
//             message: "Invalid or expired token" 
//         });
//     }
// };

// export default authUser;