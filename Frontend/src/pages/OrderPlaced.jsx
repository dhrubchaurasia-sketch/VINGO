import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

function OrderPlaced() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff9f6] px-4">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-lg text-center">

        {/* Green Success Icon */}
        <div className="flex justify-center mb-5">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Order Placed!
        </h1>

        {/* Message */}
        <p className="text-black text-sm sm:text-base mb-7 leading-relaxed">
          Thank you for your purchase. Your food is being prepared.
        
        </p>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e64326] transition-colors"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
}

export default OrderPlaced;