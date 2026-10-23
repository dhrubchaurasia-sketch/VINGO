import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[err,setErr] = useState("");
  const dispatch = useDispatch();

const handleSignIn = async () => {
  console.log("1. Sign In button clicked");

  try {
    console.log("2. Sending request...");

    const result = await axios.post(
      `${serverUrl}/api/auth/signin`,
      {
        email,
        password,
      },
      { withCredentials: true }
    );

    console.log("3. API Response:", result);
    console.log("4. API Data:", result.data);

    dispatch(setUserData(result.data));

    console.log("5. Redux Dispatch Done");

    setErr("");

    // Check if this runs
    // navigate("/");
  } catch (error) {
    console.log("6. Error occurred");
    console.log(error);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
    }

    setErr(error?.response?.data?.message || "Something went wrong");
  }
};

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        { withCredentials: true },
      );
      // console.log(data);
      dispatch(setUserData(data));
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={"bg-white rounded-xl shadow-lg p-8 w-full max-w-md"}
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          {" "}
          Vingo
        </h1>

        <p className="text-gray-600 mb-8">
          Sign In your account to get started with delicious food
          delieveries{" "}
        </p>

        {/* fullName */}

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Enter your email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        {/* Mobile NO.*/}

        {/* Password.*/}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
          Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter your Password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              type="button"
              className="absolute right-3 cursor-pointer top-3.5 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaRegEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>
        <div
          className="text-right mb-4 cursor-pointer text-[#ff4d2d] font-medium"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password
        </div>

        <button
          className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignIn}
        >
          Sign In
        </button>
        {err && <p className="text-red-500 text-center my-1">*{err}</p>}

        <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 cursor-pointer border-gray-400 hover:bg-gray-100" onClick={handleGoogleAuth}>
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>
        <p className="text-center mt-6" onClick={() => navigate("/signup")}>
          Want to create a new account ?{" "}
          <span className="text-[#ff4d2d]">Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
