import React from 'react';
import { FaPen } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
function OwnerItemCard({ item }) {
    const navigate = useNavigate();
  
    const serverUrl = "https://vingo-backend-ghyw.onrender.com";
  
    const handleDelete = async () => {
  try {
    const response = await fetch(
      `${serverUrl}/api/items/delete-item/${item._id}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (response.ok) {
      window.location.reload();
    } else {
      console.error("Error deleting item:", data.message);
    }

  } catch (error) {
    console.error("Error deleting item:", error.message);
  }
};

  return (
    
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
      <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg text-black" />
      <h3 className="text-sm mt-2 text-black">{item.category}</h3>
     <div className="flex items-center gap-2 mt-1">
     <span className={`w-5 h-5 border-2 flex items-center justify-center ${ item.foodType === "veg" ? "border-green-600" : "border-red-600"  }`}>
     <span className={`w-2.5 h-2.5 rounded-full ${  item.foodType === "veg" ? "bg-green-600" : "bg-red-600"  }`} ></span>
     </span>
  <span className="text-gray-500 text-sm">
    {item.foodType}
  </span>
</div>
      <h3 className="text-lg font-bold mt-2">{item.name}</h3>
      <div className="flex justify-between items-center mt-2">
  <p className="text-gray-600">
    ₹{item.price.toFixed(2)}
  </p>

  <div className="flex gap-3">
    <button className="text-orange-500 hover:text-orange-700 cursor-pointer" onClick={() => {
      navigate(`/edit-food-item/${item._id}`);
    }}>
      <FaPen size={18} />
    </button>

    <button className="text-red-500 hover:text-red-700 cursor-pointer" onClick={handleDelete}>
      <FaTrash size={18} />
    </button>
  </div>
</div>
    </div>
  )
}


export default OwnerItemCard;