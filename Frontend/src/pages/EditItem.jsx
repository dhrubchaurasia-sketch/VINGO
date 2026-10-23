
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";

function EditItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id } = useParams();

  const { myShopData } = useSelector((state) => state.owner);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFoodType, setSelectedFoodType] = useState("veg");

  const [loading, setLoading] = useState(false);

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

  const serverUrl = "https://vingo-backend-ghyw.onrender.com";

  // Get selected item from shop data
  useEffect(() => {
    if (myShopData?.items?.length > 0 && id) {
      const itemToEdit = myShopData.items.find(
        (item) => item._id === id
      );

      if (itemToEdit) {
        setName(itemToEdit.name);
        setPrice(itemToEdit.price);
        setSelectedCategory(itemToEdit.category);
        setSelectedFoodType(itemToEdit.foodType);

       
        setFrontendImage(itemToEdit.image);

       
        setBackendImage(null);
      }
    }
  }, [myShopData, id]);

  // Handle new image
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  // Update item
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", selectedCategory);
      formData.append("foodType", selectedFoodType);

      // Only send image if user selected a new one
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.put(
        `${serverUrl}/api/items/edit-item/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log("EDIT ITEM RESPONSE:", result.data);

    //   dispatch(setMyShopData(result.data));
    const updatedItem = result.data.item;

const updatedShopData = {
  ...myShopData,
  items: myShopData.items.map((item) =>
    item._id === updatedItem._id ? updatedItem : item
  ),
};

dispatch(setMyShopData(updatedShopData));

      navigate("/");
    } catch (error) {
      console.error("EDIT FOOD ITEM ERROR:", error);
      console.error("RESPONSE:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-6 bg-linear-to-br from-orange-50 to-white relative">

      {/* Back button */}
      <div
        className="absolute top-4 left-4 text-3xl text-[#ff4d2d] cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <IoMdArrowRoundBack size={35} />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">

          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>

          <div className="text-2xl font-extrabold text-gray-800">
            Edit Food Item
          </div>

        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Food Name */}
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="foodName"
            >
              Food Item Name
            </label>

            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
              id="foodName"
              placeholder="Enter the food item name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          {/* Price */}
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
              required
            />
          </div>

          {/* Food Type */}
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="foodType"
            >
              Select Food Type
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              id="foodType"
              onChange={(e) => setSelectedFoodType(e.target.value)}
              value={selectedFoodType}
            >
              <option value="veg">Vegetarian</option>
              <option value="non veg">Non-Vegetarian</option>
            </select>
          </div>

          {/* Category */}
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
              required
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="foodImage"
            >
              Food Image
            </label>

            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              type="file"
              id="foodImage"
              accept="image/*"
              onChange={handleImage}
            />

            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt={name}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Update button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditItem;