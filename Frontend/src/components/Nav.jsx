import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { IoReceipt } from "react-icons/io5";
import { LuShoppingCart } from "react-icons/lu";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const DIET_OPTIONS = [
  { id: "all", label: "All", dotClass: "" },
  { id: "veg", label: "Veg", dotClass: "bg-green-600" },
  { id: "nonveg", label: "Non-Veg", dotClass: "bg-red-600" },
];

function DietFilterBar({ dietFilter, onSelectDiet, compact = false }) {
  return (
    <div
      role="group"
      aria-label="Filter by Veg or Non-Veg"
      className={`inline-flex items-center bg-white border border-orange-100 rounded-xl p-1 shadow-xs shrink-0 ${
        compact ? "gap-0.5" : "gap-1"
      }`}
    >
      {DIET_OPTIONS.map((opt) => {
        const isActive = dietFilter === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectDiet(opt.id)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs"
            } ${
              isActive
                ? opt.id === "veg"
                  ? "bg-green-50 text-green-700 border border-green-200 shadow-2xs"
                  : opt.id === "nonveg"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "bg-[#ff4d2d] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-orange-50/60"
            }`}
          >
            {opt.dotClass && (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`}
                aria-hidden="true"
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Nav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { userData, currentCity, cartItems } = useSelector(
    (state) => state.user
  );

  const [ordersCount, setOrdersCount] = useState(0);
  const [ownerOrdersCount, setOwnerOrdersCount] = useState(0);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [dietFilter, setDietFilter] = useState(searchParams.get("diet") || "all");

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setDietFilter(searchParams.get("diet") || "all");
  }, [searchParams]);

  const cartCount = (cartItems || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // /home par search aur diet filter query params update karta hai
  const updateUrlFilters = (nextSearch, nextDiet) => {
    const params = new URLSearchParams();
    const trimmed = nextSearch.trim();
    if (trimmed) params.set("search", trimmed);
    if (nextDiet && nextDiet !== "all") params.set("diet", nextDiet);

    const queryString = params.toString();
    navigate(queryString ? `/home?${queryString}` : "/home");
  };

  // Diet filter change handler
  const handleDietChange = (nextDiet) => {
    setDietFilter(nextDiet);
    updateUrlFilters(searchQuery, nextDiet);
  };

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    updateUrlFilters(searchQuery, dietFilter);
    setShowSearch(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateUrlFilters("", dietFilter);
    setShowSearch(false);
  };

  // Customer order count
  useEffect(() => {
    const fetchOrdersCount = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/order/my-orders`,
          { withCredentials: true }
        );

        setOrdersCount(response.data.orders?.length || 0);
      } catch (error) {
        console.error("Error fetching orders count:", error);
      }
    };

    if (userData?.role === "user") {
      fetchOrdersCount();
    } else {
      setOrdersCount(0);
    }
  }, [userData]);

  // Owner order count
  useEffect(() => {
    const fetchOwnerOrdersCount = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/order/owner-orders`,
          { withCredentials: true }
        );

        setOwnerOrdersCount(response.data.orders?.length || 0);
      } catch (error) {
        console.error("Error fetching owner orders count:", error);
      }
    };

    if (userData?.role === "owner") {
      fetchOwnerOrdersCount();
    } else {
      setOwnerOrdersCount(0);
    }
  }, [userData]);

  // Logout
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setShowInfo(false);
      navigate("/signin");
    } catch (error) {
      console.error("Error while logging out:", error);
    }
  };

  return (
    <>
      {/* MAIN NAVBAR */}
      <nav className="fixed top-0 left-0 z-9999 w-full bg-[#fff9f6]/95 backdrop-blur-md border-b border-orange-100/80">
        <div className="max-w-375 mx-auto h-19 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">

          {/* LOGO */}
          <h1
            onClick={() => navigate("/home")}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#ff4d2d] cursor-pointer select-none shrink-0"
          >
            Vingo
          </h1>

          {/* DESKTOP LOCATION + SEARCH + VEG/NON-VEG FILTER */}
          {userData?.role === "user" && (
            <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-2xl">
              <form
                onSubmit={handleSearch}
                className="flex items-center flex-1 min-w-0 h-12 bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 px-3"
              >
                {/* LOCATION */}
                <div className="flex items-center gap-2 min-w-0 max-w-[34%] pr-3 border-r border-orange-100">
                  <FaLocationDot
                    size={16}
                    className="text-[#ff4d2d] shrink-0"
                  />

                  <span className="text-sm font-semibold text-gray-700 truncate">
                    {currentCity || "New Delhi"}
                  </span>
                </div>

                {/* SEARCH */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pl-3">
                  <button
                    type="submit"
                    aria-label="Search food"
                    className="text-[#ff4d2d] hover:scale-110 transition-transform shrink-0"
                  >
                    <FaSearch size={16} />
                  </button>

                  <input
                    type="text"
                    placeholder="Search delicious food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-0 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                      className="text-gray-400 hover:text-[#ff4d2d] shrink-0"
                    >
                      <ImCross size={12} />
                    </button>
                  )}
                </div>
              </form>

              {/* VEG / NON-VEG FILTER */}
              <DietFilterBar
                dietFilter={dietFilter}
                onSelectDiet={handleDietChange}
              />
            </div>
          )}

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* MOBILE SEARCH */}
            {userData?.role === "user" && (
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                aria-label="Open search"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-orange-100 text-[#ff4d2d] hover:bg-orange-50 transition"
              >
                <FaSearch size={18} />
              </button>
            )}

            {/* CUSTOMER ORDERS */}
            {userData?.role === "user" && (
              <button
                type="button"
                onClick={() => navigate("/my-orders")}
                className="relative flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl bg-white border border-orange-100 text-gray-700 hover:text-[#ff4d2d] hover:bg-orange-50 hover:border-orange-200 transition-all"
              >
                <IoReceipt size={19} className="text-[#ff4d2d]" />

                <span className="hidden sm:inline text-sm font-semibold">
                  My Orders
                </span>

                {ordersCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-[#ff4d2d] text-white text-[10px] font-bold border-2 border-[#fff9f6]">
                    {ordersCount}
                  </span>
                )}
              </button>
            )}

            {/* OWNER ORDERS */}
            {userData?.role === "owner" && (
              <button
                type="button"
                onClick={() => navigate("/owner-orders")}
                className="relative flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl bg-white border border-orange-100 text-gray-700 hover:text-[#ff4d2d] hover:bg-orange-50 transition-all"
              >
                <IoReceipt size={19} className="text-[#ff4d2d]" />

                <span className="hidden sm:inline text-sm font-semibold">
                  Shop Orders
                </span>

                {ownerOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-[#ff4d2d] text-white text-[10px] font-bold border-2 border-[#fff9f6]">
                    {ownerOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* ADD FOOD - OWNER MOBILE */}
            {userData?.role === "owner" && (
              <button
                type="button"
                onClick={() => navigate("/add-food-items")}
                aria-label="Add food"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#ff4d2d] text-white hover:bg-[#e94325] transition"
              >
                <FaPlus size={17} />
              </button>
            )}

            {/* CART */}
            {userData?.role === "user" && (
              <button
                type="button"
                onClick={() => navigate("/cart")}
                aria-label="Open cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-orange-100 text-[#ff4d2d] hover:bg-orange-50 hover:border-orange-200 transition"
              >
                <LuShoppingCart size={22} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-[#ff4d2d] text-white text-[10px] font-bold border-2 border-[#fff9f6]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* PROFILE */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInfo((prev) => !prev)}
                aria-label="Profile menu"
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white border border-orange-100 hover:border-orange-300 hover:shadow-sm transition"
              >
                <span className="w-9 h-9 rounded-full bg-linear-to-br from-[#ff704f] to-[#ff4d2d] text-white flex items-center justify-center text-base font-bold shadow-sm">
                  {userData?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
                </span>

                <FaChevronDown
                  size={11}
                  className={`hidden sm:block text-gray-500 transition-transform ${
                    showInfo ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {showInfo && (
                <>
                  <button
                    type="button"
                    aria-label="Close profile menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setShowInfo(false)}
                  />

                  <div className="absolute top-14 right-0 z-20 w-60 bg-white rounded-2xl border border-orange-100 shadow-xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-3 border-b border-gray-100 mb-2">
                      <p className="font-bold text-gray-900 truncate">
                        {userData?.fullName || "User"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {userData?.role || "Account"}
                      </p>
                    </div>

                    {userData?.role === "user" && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/my-orders");
                          setShowInfo(false);
                        }}
                        className="sm:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] transition"
                      >
                        <IoReceipt size={18} />
                        My Orders
                      </button>
                    )}

                    {userData?.role === "owner" && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/owner-orders");
                          setShowInfo(false);
                        }}
                        className="sm:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] transition"
                      >
                        <IoReceipt size={18} />
                        Shop Orders
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt size={16} />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH + FILTER PANEL */}
        {showSearch && userData?.role === "user" && (
          <div className="md:hidden max-w-150 mx-auto px-4 pb-4 space-y-2.5">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 w-full h-12 px-3 bg-white border border-orange-100 rounded-xl shadow-sm"
            >
              <FaLocationDot
                size={16}
                className="text-[#ff4d2d] shrink-0"
              />

              <span className="max-w-20 truncate text-xs font-semibold text-gray-600">
                {currentCity || "New Delhi"}
              </span>

              <button
                type="submit"
                aria-label="Search food"
                className="text-[#ff4d2d] shrink-0"
              >
                <FaSearch size={17} />
              </button>

              <input
                type="text"
                placeholder="Search delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() => setShowSearch(false)}
                aria-label="Close search"
                className="text-gray-400 hover:text-[#ff4d2d] shrink-0"
              >
                <ImCross size={13} />
              </button>
            </form>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Dietary preference:
              </span>
              <DietFilterBar
                dietFilter={dietFilter}
                onSelectDiet={handleDietChange}
                compact
              />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Nav;