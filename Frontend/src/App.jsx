
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage from "./components/LandingPage";

import useLocomotive from "./hooks/useLocomotive";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetShopByCity from "./hooks/UseGetShopByCity";
import useUpdateLocation from "./hooks/useUpdateLocation";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import OwnerOrders from "./pages/OwnerOrders";
import AddItem from "./pages/AddItem";
import CreateEditShop from "./pages/createEditShop";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";

import DeliveryBoy from "./components/DeliveryBoy";

export const serverUrl = import.meta.env.VITE_SERVER_URL;

function App() {
  const { userData, currentCity } = useSelector(
    (state) => state.user
  );

  useGetCurrentUser();
  useGetCity();
  useGetMyShop(userData?.role === "owner");
  useGetItemsByCity(currentCity);
  useGetShopByCity(currentCity);
  useLocomotive();

  const { updateLocation } = useUpdateLocation();

  React.useEffect(() => {
    if (!userData?._id) return;

    const updateCurrentLocation = () => {
      updateLocation().catch((err) => {
        console.error("Location update failed:", err);
      });
    };

    updateCurrentLocation();

    const intervalId = setInterval(updateCurrentLocation, 5000);

    return () => clearInterval(intervalId);
  }, [userData?._id, updateLocation]);

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Routes */}
      <Route
        path="/signup"
        element={
          !userData ? <SignUp /> : <Navigate to="/home" replace />
        }
      />

      <Route
        path="/signin"
        element={
          !userData ? <SignIn /> : <Navigate to="/home" replace />
        }
      />

      <Route
        path="/forgot-password"
        element={
          !userData ? (
            <ForgotPassword />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/home"
        element={
          userData ? <Home /> : <Navigate to="/signin" replace />
        }
      />

      {/* Shop Routes */}
      <Route path="/create-edit-shop" element={<CreateEditShop />} />
      <Route path="/add-food-items" element={<AddItem />} />
      <Route path="/edit-food-item/:id" element={<EditItem />} />

      {/* Order Routes */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-placed" element={<OrderPlaced />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/owner-orders" element={<OwnerOrders />} />

      {/* Delivery Route */}
      <Route path="/delivery-boy" element={<DeliveryBoy />} />

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
