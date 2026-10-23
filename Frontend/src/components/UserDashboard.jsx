import React, { useRef } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import useGetShopByCity from "../hooks/UseGetShopByCity.jsx";
import useGetItemsByCity from "../hooks/useGetItemsByCity.jsx";
import FoodCard from "./FoodCard";

function UserDashboard() {
  // Current city and data from Redux
  const { currentCity, shopsInMyCity, itemsInMyCity } = useSelector(
    (state) => state.user,
  );

  // Fetch shops and food items according to current city
  useGetShopByCity(currentCity);
  useGetItemsByCity(currentCity);

  // Refs for horizontal scrolling
  const categoryRef = useRef(null);
  const shopRef = useRef(null);

  // Search functionality
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const filteredItems = (itemsInMyCity || []).filter((item) =>
    (item.name || "").toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  // Scroll categories
  const scrollCategoryLeft = () => {
    categoryRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollCategoryRight = () => {
    categoryRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  // Scroll shops
  const scrollShopLeft = () => {
    shopRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollShopRight = () => {
    shopRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />

      {/* ================= CATEGORIES ================= */}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-3">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-medium tracking-tight text-gray-900 border-l-4 border-[#ff4d2d] pl-4 py-1">
          Inspirations for your first order
          <span className="block text-sm sm:text-base font-medium text-gray-500 mt-2 tracking-normal">
            Discover something delicious today.
          </span>
        </h1>

        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={scrollCategoryLeft}
            aria-label="Scroll categories left"
            className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all"
          >
            <FaChevronLeft />
          </button>

          <div
            ref={categoryRef}
            className="flex-1 flex overflow-x-auto gap-4 scroll-smooth scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                category={category.category}
                image={category.image}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={scrollCategoryRight}
            aria-label="Scroll categories right"
            className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* ================= BEST SHOPS ================= */}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-3">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-medium tracking-tight text-gray-900 border-l-4 border-[#ff4d2d] pl-4 py-1">
          Best shops in{" "}
          <span className="text-[#ff4d2d]">{currentCity || "your city"}</span>
          <span className="block text-sm sm:text-base font-medium text-gray-500 mt-2 tracking-normal">
            Discover the best food spots around you.
          </span>
        </h1>

        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={scrollShopLeft}
            aria-label="Scroll shops left"
            className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all"
          >
            <FaChevronLeft />
          </button>

          <div
            ref={shopRef}
            className="flex-1 flex overflow-x-auto gap-4 scroll-smooth scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {(shopsInMyCity || []).map((shop, index) => (
              <CategoryCard
                key={shop._id || index}
                category={shop.name}
                image={shop.image}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={scrollShopRight}
            aria-label="Scroll shops right"
            className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* ================= SEARCH RESULTS / FOOD ITEMS ================= */}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-3">
        <div className="w-full flex justify-between items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-medium tracking-tight text-gray-900 border-l-4 border-[#ff4d2d] pl-4 py-1">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Suggested Food Items"}

            <span className="block text-sm sm:text-base font-medium text-gray-500 mt-2 tracking-normal">
              {searchQuery
                ? "Find your favourite food from the search results."
                : "Explore delicious dishes picked just for you."}
            </span>
          </h1>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="text-[#ff4d2d] font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredItems.map((item, index) => {
              // Debug: verify actual item and shop IDs
              // Remove this console after checking the output.
              // console.log("FOOD ITEM DATA:", item);
              // console.log("SHOP VALUE:", item.shop);

              return (
                <FoodCard
                  key={item._id || index}
                  id={item._id}
                  category={item.name}
                  image={item.image}
                  foodType={item.foodType}
                  price={item.price}
                  shop={item.shop?._id || item.shop || "Shop Name"} // Fallback to shop ID or name
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full py-10 text-center">
            <p className="text-gray-700 text-lg font-semibold">
              No food items found!
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Try searching for another food item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
