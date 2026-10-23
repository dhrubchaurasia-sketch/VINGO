import  express from "express";

import {signIn,signUp,signOut, verifyOtp, resetPassword,sendOtp,googleAuth,getCurrentUser} from "../controllers/auth.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const authRouter =express.Router();

authRouter.get("/current", isAuth, getCurrentUser);
authRouter.post("/signin",signIn)

authRouter.post("/signup",signUp)

authRouter.get("/signout",signOut)

authRouter.post("/send-otp",sendOtp)

authRouter.post("/verify-otp",verifyOtp)

authRouter.post("/reset-password",resetPassword)

authRouter.post("/google-auth",googleAuth)

export default authRouter;