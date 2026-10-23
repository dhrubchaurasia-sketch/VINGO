// import jwt from "jsonwebtoken";
// const isAuth = async(req,res,next) =>{
//     try {
//         const token = req.cookies.token;
//         console.log("TOKEN FROM COOKIE:", token);
//         if(!token){
//             return res.status(400).json({message:"Token not found"});
//         }
//         const decodeToken = jwt.verify(token,process.env.JWT_SECRET);
//         console.log("DECODED TOKEN:", decodeToken);
//         if(!decodeToken){
//             return res.status(400).json({message:"Invalid token"});
//         }
//         req.userId = decodeToken.userId;
//         next();
//     } catch (error) {
//         console.log("AUTH ERROR:", error);
//         return res.status(500).json({message:"isAuth error"});
//     }
// }
// export default isAuth;

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "Token not found",
      });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodeToken) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }

    req.userId = decodeToken.userId;

    const user = await User.findById(decodeToken.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);

    return res.status(500).json({
      message: "isAuth error",
      error: error.message,
    });
  }
};

export default isAuth;
