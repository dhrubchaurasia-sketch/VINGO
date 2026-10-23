import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // SendOtp
  const handleSendOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true },
      );
      console.log(result);
      setErr("");
      setStep(2);
    } catch (error) {
      console.log(error);
      setErr(error?.response?.data?.message);
    }
  };

  // verify otp
  const handleVerifyOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      console.log(result);
      setErr("");
      setStep(3);
    } catch (error) {
      console.log(error);
      setErr(error?.response?.data?.message);
    }
  };
  // Reset Password
  const handleResetPassword = async () => {
    if (newPassword != confirmPassword) {
      return null;
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true },
      );
      console.log(result);
      setErr("");
      setStep(3);
      navigate("/signin");
    } catch (error) {
      console.log(error);
      setErr(error?.response?.data?.message);
    }
  };
  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>
        {step == 1 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <button
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleSendOtp}
            >
              Send OTP
            </button>
            {err && <p className="text-red-500 text-center my-1">*{err}</p>}
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
              />
            </div>
            <button
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleVerifyOtp}
            >
              Verify{" "}
            </button>
          </div>
        )}

        {step == 3 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2  pr-10 focus:outline-none"
                  placeholder="Enter New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <FaRegEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none"
                  placeholder="Confirm Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <button
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleResetPassword}
            >
              Reset Password
              {err && <p className="text-red-500 text-center my-1">*{err}</p>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
