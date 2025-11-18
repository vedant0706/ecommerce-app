import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("🔍 Received Token:", token);  // DEBUG

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized Login Again (no token sent)" });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = verify.id;

        console.log("✅ Token Verified:", verify); // DEBUG
        next();
    } catch (err) {
        console.log("❌ Token Error:", err.message);
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

export default authUser;
