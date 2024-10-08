import JWT from "jsonwebtoken";
import userModel from "../models/userModels.js";

export const requireSignIn = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  
  const authToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  console.log("Token received for verification:", authToken);
  
  JWT.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message); // Log error before sending response
      return res.status(401).json({ error: "Invalid token" });
    }
    
    req.user = decoded; 
    next(); 
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.error("Admin check error:", error.message); // Log specific error message
    res.status(500).send({
      success: false,
      error,
      message: "Error in admin middleware",
    });
  }
};

