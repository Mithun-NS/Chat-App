import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.header('token'); // ✅ fixed here

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};


// import User from "../models/User.js";
// import jwt from "jsonwebtoken";


// // Middleware to protect routes


// export const protectRoute = async(req,res,next)=>{
//     try{
//         const token = req.header.token;

//         const decoded = jwt.verify(token, process.env.JWT_SECRET)

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user) return res.json({success: false, message: "User not found"});
//         req.user = user;
//         next();
//     }catch(error){
//         res.json({success: false, message: error.message});
//     }
// }