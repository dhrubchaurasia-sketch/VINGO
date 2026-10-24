import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useLocomotive from "./hooks/useLocomotive";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import Home from "./pages/Home";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import OwnerOrders from "./pages/OwnerOrders";

// import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyShop from "./hooks/useGetMyShop";
import { useSelector } from "react-redux";
import DeliveryBoy from "./components/DeliveryBoy";
// import useGetShopByCity from "./hooks/UseGetShopByCity";
import AddItem from "./pages/AddItem";
import CreateEditShop from "./pages/createEditShop";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import useUpdateLocation from "./hooks/useUpdateLocation";
export const serverUrl = "https://vingo-backend-ghyw.onrender.com";
function App() {
  const { userData } = useSelector((state) => state.user);
  useGetCurrentUser();
  useGetCity();
  // useUpdateLocation();
  useGetMyShop(userData?.role === "owner");
  useLocomotive();

  const { updateLocation } = useUpdateLocation();

 React.useEffect(() => {
  if (!userData?._id) return;

  const updateCurrentLocation = () => {
    updateLocation().catch((err) => {
      console.error("Location update failed:", err);
    });
  };

  // Initial location update
  updateCurrentLocation();

  // Update location periodically for testing
  const intervalId = setInterval(updateCurrentLocation, 5000);

  return () => clearInterval(intervalId);
}, [userData?._id, updateLocation]);
  return (
    <Routes>
      <Route path="/signup"  element={!userData ? <SignUp /> : <Navigate to="/" />}/>
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
      <Route  path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />}/>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={!userData ? <Navigate to="/signup" replace /> : <Home />}/>
      <Route path="/create-edit-shop" element={<CreateEditShop />} />
      <Route path="/add-food-items" element={<AddItem />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/edit-food-item/:id" element={<EditItem />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path = "/order-placed" element={<OrderPlaced />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/owner-orders" element={<OwnerOrders />} />
      <Route path="/delivery-boy" element={<DeliveryBoy />} />
    </Routes>
  );
}

export default App;
