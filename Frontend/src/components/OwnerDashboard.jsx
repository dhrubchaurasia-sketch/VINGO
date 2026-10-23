import React, { useState } from "react";
import { FaUtensils, FaPen } from "react-icons/fa";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./ownerItemCard";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  const [availableBoys, setAvailableBoys] = useState([]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />

      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />

              <h2 className="text-xl font-bold mt-4">Add Your Restaurant</h2>

              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and showcase your restaurant to
                a wider audience!
              </p>

              <button
                className="bg-[#ff4d2d] text-white py-2 px-4 sm:px-6 rounded-full hover:bg-orange-600 transition-colors duration-200"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          {/* Restaurant heading */}
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <FaUtensils className="text-[#ff4d2d] w-10 h-10" />
            Welcome to {myShopData.name}
          </h1>

          {/* Restaurant details */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <div
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={20} />
            </div>

            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />

            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h2>

              <p className="text-gray-700">
                {myShopData.city}, {myShopData.state}
              </p>

              <p className="text-gray-700">{myShopData.address}</p>
            </div>
          </div>

          {/* Add food items */}
          <div className="flex justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />

                <h2 className="text-xl font-bold mt-4">Add Your Food Items</h2>

                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Share your delicious food items with the world by adding them
                  to the menu!
                </p>

                <button
                  className="bg-[#ff4d2d] text-white py-2 px-4 sm:px-6 rounded-full hover:bg-orange-600 transition-colors duration-200"
                  onClick={() => navigate("/add-food-items")}
                >
                  Add Food Items
                </button>
              </div>
            </div>
          </div>

          {/* Food items */}
          {myShopData.items?.length > 0 && (
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              {myShopData.items.map((item) => (
                <OwnerItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
