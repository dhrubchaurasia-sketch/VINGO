import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";
import crypto from "crypto";

// Sign Up
// export const signUp = async (req, res) => {
//   try {
//     const { fullName, email, password, mobile, role } = req.body;
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: "User already exist." });
//     }
//     if (!password || password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters." });
//     }
//     if (!/^[0-9]{10}$/.test(mobile)) {
//       return res
//         .status(400)
//         .json({ message: "Mobile no must be at least 10 digits." });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     user = await User.create({
//       fullName,
//       email,
//       role,
//       mobile,
//       password: hashedPassword,
//     });
//     const token = await genToken(user._id);
//     res.cookie("token", token, {
//       secure: false,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//     });
//     return res.status(201).json(user);
//   } catch (error) {
//     return res.status(500).json(`Sign up error ${error}`);
//   }
// };
//   naya code
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Get Current User Error: ${error.message}`,
    });
  }
};
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    console.log("========== SIGNUP REQUEST ==========");
    console.log("Request Body:", req.body);
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Mobile:", mobile);
    console.log("Role:", role);

    let user = await User.findOne({ email });

    console.log("Searching Email:", email);
    console.log("Found User:", user);

    if (user) {
      return res.status(400).json({
        message: "User already exist.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        message: "Mobile no must be at least 10 digits.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedPassword,
    });

    console.log("New User Created:", user);

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      message: `Sign up error: ${error.message}`,
    });
  }
};



























// Sign In
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password." });
    }
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(`Sign In error ${error}`);
  }
};
// Sign Out
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Log Out Successfully" });
  } catch (error) {
    return res.status(500).json(`Sign Out error ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    //
    console.log("Send OTP API called");
    console.log(req.body);
    //
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log("Generated OTP:", otp);
    console.log("Sending OTP to:", email);
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpEmail(email, otp);
    return res.status(200).json({ message: "OTP Sent Successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid/Expired Otp." });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "OTP Verified Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Verify Otp Error ${error}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Reset Password Error ${error}` });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role: "user",
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Google Auth Error: ${error.message}`,
    });
  }
};
