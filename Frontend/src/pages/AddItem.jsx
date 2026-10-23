import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];
  const [selectedCategory, setSelectedCategory] = useState("");
  const foodTypes = ["veg", "non veg"];
  const [selectedFoodType, setSelectedFoodType] = useState("veg");
  const serverUrl = "http://localhost:8000";

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", selectedCategory);
      formData.append("foodType", selectedFoodType);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/add-food-items`,
        formData,
        {
          withCredentials: true,
        },
      );

      dispatch(setMyShopData(result.data));

      console.log("SHOP RESPONSE:", result.data);

      navigate("/");
    } catch (error) {
      console.error("CREATE SHOP ERROR:", error);
      console.error("RESPONSE:", error.response?.data);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-6 bg-linear-to-br from-orange-50 to-white relative">
      <div
        className="absolute top-4 left-4 text-3xl text-[#ff4d2d] cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <IoMdArrowRoundBack size={35} />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>

          <div className="text-2xl font-extrabold text-gray-800">
            Add Food Item
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="shopName"
            >
              Food Item Name
            </label>

            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
              id="shopName"
              placeholder="Enter the food item name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="price"
            >
              Price
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="number"
              id="price"
              placeholder="Enter the price"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>


           <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="category" >
             Select Food Type
            </label>
            
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              id="category"
              onChange={(e) => setSelectedFoodType(e.target.value)}
              value={selectedFoodType}
            >
              <option value="veg">Vegetarian</option>
              <option value="non veg">Non-Vegetarian</option>
            </select>
          </div>

          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="category"
            >
              Category
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              id="category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
         
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="shopImage"
            >
              Food Image
            </label>

            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              type="file"
              id="shopImage"
              accept="image/*"
              onChange={handleImage}
            />

            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition-all duration-200 cursor-pointer"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
