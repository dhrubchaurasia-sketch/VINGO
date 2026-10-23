import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { FaLocationDot } from "react-icons/fa6";
import {
  FaBoxOpen,
  FaUtensils,
  FaCreditCard,
  FaCalendarAlt,
  FaArrowLeft,
  FaReceipt,
  FaShoppingBag,
  FaRedo,
} from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import { io } from "socket.io-client";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [arrivalNotification, setArrivalNotification] = useState("");

  // Fetch logged-in customer's orders.
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
        withCredentials: true,
      });

      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);

      const hasActiveDelivery = fetchedOrders.some((order) =>
        order.shopOrder?.some(
          (shopOrder) => shopOrder.status === "Out for Delivery"
        )
      );

      const hasDeliveredOrder = fetchedOrders.some((order) =>
        order.shopOrder?.some((shopOrder) => shopOrder.status === "Delivered")
      );

      // Clear the arrival notification once delivery is no longer active
      // and at least one order has reached Delivered status.
      if (!hasActiveDelivery && hasDeliveredOrder) {
        setArrivalNotification("");
      }
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to fetch your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to Socket.IO and listen for delivery arrival.
  useEffect(() => {
    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Customer Socket connected:", socket.id);
    });

    socket.on("connect_error", (socketError) => {
      console.error("Customer Socket connection error:", socketError.message);
    });

    socket.on("delivery-boy-reached", (data) => {
      console.log("🔔 ARRIVAL NOTIFICATION RECEIVED:", data);

      setArrivalNotification(
        data?.message || "Your delivery partner has reached your location!",
      );

      // Refresh order information without removing the notification.
      fetchOrders();
    });
    socket.on("delivery-completed", (data) => {
      console.log("✅ DELIVERY COMPLETED:", data);

      // Remove the arrival notification immediately
      setArrivalNotification("");

      // Fetch the latest order status from the backend
      fetchOrders();
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("delivery-boy-reached");
      socket.off("delivery-completed");
      socket.disconnect();
    };
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Delivery arrival notification */}
        {arrivalNotification && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden="true">
                🛵
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-green-800">
                  Delivery Partner Has Arrived!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  {arrivalNotification}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setArrivalNotification("")}
                className="font-bold text-green-700 hover:text-green-900"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-700" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#ff4d2d]">
              My Orders
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Track your orders and view your order details.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <ImSpinner8 className="text-orange-500 text-4xl animate-spin" />
            <p className="text-gray-600 mt-4 font-medium">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <MdErrorOutline className="text-red-500 text-5xl mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800">
              Something went wrong
            </h2>
            <p className="text-gray-500 mt-2 mb-5">{error}</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              <FaRedo />
              Try Again
            </button>
          </div>
        )}

        {/* Empty Orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-14 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <FaBoxOpen className="text-orange-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No orders yet!</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Looks like you haven't ordered anything yet. Explore delicious
              food and place your first order.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <FaShoppingBag />
              Order Food
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                You have{" "}
                <span className="font-bold text-gray-900">{orders.length}</span>{" "}
                {orders.length === 1 ? "order" : "orders"}
              </p>

              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm"
              >
                <FaRedo />
                Refresh
              </button>
            </div>

            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 sm:p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaReceipt className="text-orange-500" />
                        <h2 className="font-bold text-gray-900">
                          Order Details
                        </h2>
                      </div>
                      <p className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <FaCalendarAlt className="text-orange-500" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentMethod === "cod"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shop Orders */}
                <div className="p-5 sm:p-6">
                  {order.shopOrder?.map((shopOrder) => (
                    <div key={shopOrder._id} className="mb-6 last:mb-0">
                      {/* Restaurant Details */}
                      <div className="flex items-center gap-4 mb-5">
                        {shopOrder.shop?.image ? (
                          <img
                            src={shopOrder.shop.image}
                            alt={shopOrder.shop.name || "Restaurant"}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center">
                            <FaUtensils className="text-orange-500 text-2xl" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {shopOrder.shop?.name || "Restaurant"}
                          </h3>
                          {shopOrder.shop?.address && (
                            <p className="text-sm text-gray-500 mt-1">
                              {shopOrder.shop.address}
                            </p>
                          )}
                          <p className="text-sm text-orange-600 font-semibold mt-1">
                            Subtotal: {formatPrice(shopOrder.subTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-gray-800">
                              Order Status
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Track the progress of your order.
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              shopOrder.status === "Preparing"
                                ? "bg-blue-100 text-blue-700"
                                : shopOrder.status === "Out for Delivery"
                                  ? "bg-purple-100 text-purple-700"
                                  : shopOrder.status === "Delivered"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {shopOrder.status || "Pending"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            "Pending",
                            "Preparing",
                            "Out for Delivery",
                            "Delivered",
                          ].map((status, index) => {
                            const statuses = [
                              "Pending",
                              "Preparing",
                              "Out for Delivery",
                              "Delivered",
                            ];
                            const currentIndex = statuses.indexOf(
                              shopOrder.status || "Pending",
                            );
                            const isComplete = index <= currentIndex;

                            return (
                              <div
                                key={status}
                                className={`rounded-lg px-2 py-2 text-center text-xs sm:text-sm font-medium ${
                                  isComplete
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {status}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Food Items */}
                      <div className="space-y-3">
                        {shopOrder.shopOrderItems?.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between gap-4 py-3 px-4 bg-[#fffaf5] rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800">
                                {item.name || item.item?.name || "Food Item"}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-gray-900 whitespace-nowrap">
                              {formatPrice(
                                Number(item.price) * Number(item.quantity),
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="px-5 sm:px-6 py-5 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center">
                      <FaLocationDot className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">
                        Delivery Address
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.deliveryAddress?.text ||
                          "Delivery address unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Summary */}
                <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCreditCard className="text-orange-500" />
                      <span className="text-sm">
                        {order.paymentMethod === "cod"
                          ? "Pay on delivery"
                          : "Online payment"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Total Paid / Payable
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
