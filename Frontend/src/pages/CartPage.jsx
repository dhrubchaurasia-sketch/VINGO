import React from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


import {
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
} from "../redux/userSlice";

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);

  // ================= TOTAL PRICE =================

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6 pt-24">

      <div className="w-full max-w-100">

        {/* ================= HEADER ================= */}

        <div className="flex items-center gap-4 mb-6">

          <button
            onClick={() => navigate("/")}
            className="text-[#ff4d2d] cursor-pointer"
          >
            <IoMdArrowRoundBack size={32} />
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Your Cart
          </h1>

        </div>

        {/* ================= EMPTY CART ================= */}

        {cartItems.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <p className="text-gray-500 text-lg">
              Your cart is empty.
            </p>

          </div>

        ) : (

          <>

            {/* ================= CART ITEMS ================= */}

            <div className="space-y-4">

              {cartItems.map((item) => {

                const itemTotal =
                  Number(item.price || 0) *
                  Number(item.quantity || 0);

                return (

                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4"
                  >

                    {/* ================= LEFT SIDE ================= */}

                    <div className="flex items-center gap-4 min-w-0">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />

                      <div className="min-w-0">

                        <h2 className="text-lg font-semibold text-gray-800 truncate">
                          {item.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                          ₹{Number(item.price).toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>

                        <p
                          className={`text-xs font-medium ${
                            item.foodType === "veg"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.foodType === "veg"
                            ? "Veg"
                            : "Non-Veg"}
                        </p>

                        {/* ITEM TOTAL */}

                        <p className="text-base font-bold text-[#ff4d2d] mt-1">
                          ₹{itemTotal.toFixed(2)}
                        </p>

                      </div>

                    </div>

                    {/* ================= RIGHT SIDE ================= */}

                    <div className="flex items-center gap-3">

                      {/* MINUS */}

                      <button
                        onClick={() =>
                          dispatch(decreaseCartQuantity(item.id))
                        }
                        disabled={item.quantity <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          item.quantity <= 1
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <FaMinus size={11} />
                      </button>

                      {/* QUANTITY */}

                      <span className="w-6 text-center font-semibold">
                        {item.quantity}
                      </span>

                      {/* PLUS */}

                      <button
                        onClick={() =>
                          dispatch(increaseCartQuantity(item.id))
                        }
                        className="w-8 h-8 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center hover:bg-[#e63f22] transition"
                      >
                        <FaPlus size={11} />
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          dispatch(removeFromCart(item.id))
                        }
                        className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition ml-2"
                      >
                        <FaTrash size={14} />
                      </button>

                    </div>

                  </div>

                );
              })}

            </div>

            {/* ================= TOTAL ================= */}

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">

              <div className="flex items-center justify-between">

                <span className="text-lg font-semibold text-gray-700">
                  Total Price
                </span>

                <span className="text-2xl font-bold text-[#ff4d2d]">
                  ₹{totalPrice.toFixed(2)}
                </span>

              </div>
            </div>
            <div>
                <button className="bg-[#ff4d2d] text-white px-6 py-3  ml-20 mt-7 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer"   onClick={() => navigate("/checkOut")}>Proceed to Checkout</button>
              </div>

          </>

        )}

      </div>

    </div>
  );
}

export default CartPage;