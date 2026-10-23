import React, { useState, useEffect } from "react";
import { FaSquare } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa6";
import { FaRegSquare } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import {
  addToCart,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
} from "../redux/userSlice";

import { useDispatch, useSelector } from "react-redux";

function FoodCard({ id, category, image, foodType, price, shop }) {
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);

  // Find food item in cart
  const cartItem = (cartItems || []).find(
    (item) => String(item.id) === String(id),
  );

  // Local quantity before adding to cart
  const [localQuantity, setLocalQuantity] = useState(0);

  // Show cart quantity or locally selected quantity
  const quantity = cartItem ? Number(cartItem.quantity) : localQuantity;

  // Render rating stars
  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          fill={i < 4 ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-yellow-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>,
      );
    }

    return stars;
  };

  // Add item to cart only when cart icon is clicked
  const handleCart = () => {
    if (cartItem) {
      return;
    }

    if (localQuantity <= 0) {
      alert("Please select quantity first!");
      return;
    }

    // Get shop ID
    const shopId = typeof shop === "object" ? shop?._id : shop;

    if (!id || !shopId) {
      console.error("Missing food ID or shop ID:", {
        id,
        shop,
      });

      alert("Food item or shop details are missing.");
      return;
    }

    // Add selected quantity to Redux cart
    dispatch(
      addToCart({
        id,
        name: category,
        price: Number(price),
        image,
        shop: shopId,
        quantity: localQuantity,
        foodType,
      }),
    );
  };

  // Increase quantity
  const increaseQuantity = () => {
    if (cartItem) {
      dispatch(increaseCartQuantity(cartItem.id));
    } else {
      // Only increase displayed quantity
      setLocalQuantity((prev) => prev + 1);
    }
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (cartItem) {
      if (Number(cartItem.quantity) <= 1) {
        dispatch(removeFromCart(cartItem.id));
        setLocalQuantity(0);
      } else {
        dispatch(decreaseCartQuantity(cartItem.id));
      }
    } else {
      // Only decrease displayed quantity
      setLocalQuantity((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Food Image */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden">
        <img
          src={image}
          alt={category}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Food Details */}
      <div className="p-3">
        {/* Food Name */}
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {category}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {renderStars()}

          <span className="text-xs text-gray-500">(4.0)</span>
        </div>

        {/* Veg / Non-Veg Square and Price */}
        <div className="flex items-center justify-between mt-2">
          {/* Square Indicator */}
          {/* Veg / Non-Veg Indicator */}
          <div className="flex items-center gap-1">
            <span
              className={`w-5 h-5 border-2 flex items-center justify-center ${
                foodType?.toLowerCase() === "veg"
                  ? "border-green-600"
                  : "border-red-600"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  foodType?.toLowerCase() === "veg"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              />
            </span>

            <span
              className={`text-xs ${
                foodType?.toLowerCase() === "veg"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {foodType}
            </span>
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-[#ff4d2d]">₹{price}</span>
        </div>

        {/* Quantity Controls and Add to Cart */}
        <div className="flex items-center justify-between gap-2 mt-3">
          {/* Minus, Quantity, Plus */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            {/* Minus Button */}
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* Quantity */}
            <span className="min-w-5 text-center text-sm font-semibold text-gray-800">
              {quantity}
            </span>

            {/* Plus Button */}
            <button
              type="button"
              onClick={increaseQuantity}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-[#ff4d2d] text-white font-bold hover:bg-[#e64326]"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleCart}
            disabled={Boolean(cartItem)}
            title={
              cartItem
                ? "Already added to cart"
                : "Add selected quantity to cart"
            }
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-white transition-colors ${
              cartItem
                ? "bg-green-600 cursor-not-allowed"
                : "bg-[#ff4d2d] hover:bg-[#e64326]"
            }`}
          >
            <FaCartPlus className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
