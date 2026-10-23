import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Nav from "../components/Nav";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaUtensils,
  FaRedo,
  FaReceipt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { FaLocationDot } from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";
import { MdErrorOutline } from "react-icons/md";

function OwnerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState("");

  // Delivery boys state
  const [availableBoys, setAvailableBoys] = useState([]);
  const [showDeliveryBoysFor, setShowDeliveryBoysFor] = useState(null);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Preparing":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "Out for Delivery":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
    try {
      setUpdatingOrder(shopOrderId);

      const response = await axios.put(
        `${serverUrl}/api/order/${orderId}/shop-order/${shopOrderId}/status`,
        { status: newStatus },
        { withCredentials: true },
      );

      // Update status in frontend
      setOrders((previousOrders) =>
        previousOrders.map((order) => {
          if (order._id !== orderId) return order;

          return {
            ...order,
            shopOrder: order.shopOrder.map((shopOrder) =>
              shopOrder._id === shopOrderId
                ? {
                    ...shopOrder,
                    status: newStatus,
                    assignment:
                      response.data.assignment ?? shopOrder.assignment,
                  }
                : shopOrder,
            ),
          };
        }),
      );

      // Show available delivery boys when status becomes Out for Delivery
      if (newStatus === "Out for Delivery") {
        setAvailableBoys(response.data.availableBoys || []);
        setShowDeliveryBoysFor(shopOrderId);
      } else {
        setAvailableBoys([]);
        setShowDeliveryBoysFor(null);
      }
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);

      alert(error.response?.data?.message || "Unable to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Fetch owner's orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${serverUrl}/api/order/owner-orders`, {
        withCredentials: true,
      });

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("FETCH OWNER ORDERS ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to fetch your shop orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

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

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-orange-50 transition"
          >
            <FaArrowLeft />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shop Orders
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage orders received by your shop.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 font-semibold text-sm disabled:opacity-50"
          >
            <FaRedo />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center">
            <ImSpinner8 className="text-orange-500 text-4xl animate-spin" />
            <p className="mt-4 text-gray-500">Loading shop orders...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <MdErrorOutline className="text-red-500 text-5xl mx-auto" />

            <h2 className="mt-3 text-xl font-bold text-gray-800">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-500">{error}</p>

            <button
              onClick={fetchOrders}
              className="mt-5 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
              <FaBoxOpen className="text-orange-500 text-4xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No orders received yet
            </h2>

            <p className="mt-2 text-gray-500">
              Orders for your shop will appear here when customers place them.
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Total orders:{" "}
              <span className="font-bold text-gray-900">{orders.length}</span>
            </p>

            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 sm:p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FaReceipt className="text-orange-500" />

                        <h2 className="font-bold text-gray-900">
                          Order Details
                        </h2>
                      </div>

                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-orange-500" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">
                        Customer's Total Order
                      </p>

                      <p className="text-2xl font-bold text-orange-600">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Customer Details
                  </h3>

                  <p className="text-sm text-gray-600">
                    Name:{" "}
                    {order.user?.fullName ||
                      order.user?.name ||
                      "Name unavailable"}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Email: {order.user?.email || "Email unavailable"}
                  </p>

                  {order.user?.mobile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Mobile: {order.user.mobile}
                    </p>
                  )}
                </div>

                {/* Shop Orders */}
                <div className="p-5 sm:p-6">
                  {order.shopOrder?.map((shopOrder) => (
                    <div key={shopOrder._id} className="mb-6 last:mb-0">
                      {/* Shop Details */}
                      <div className="flex items-center gap-3 mb-5">
                        {shopOrder.shop?.image ? (
                          <img
                            src={shopOrder.shop.image}
                            alt={shopOrder.shop.name || "Shop"}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center">
                            <FaUtensils className="text-orange-500 text-2xl" />
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {shopOrder.shop?.name || "Your Shop"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {shopOrder.shop?.address || ""}
                          </p>

                          <p className="text-sm font-semibold text-orange-600 mt-1">
                            Your Shop Subtotal:{" "}
                            {formatPrice(shopOrder.subTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Order Status
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              Update the status of this shop order.
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-2 rounded-lg border text-sm font-semibold ${getStatusStyles(
                                shopOrder.status,
                              )}`}
                            >
                              {shopOrder.status || "Pending"}
                            </span>

                            <select
                              value={shopOrder.status || "Pending"}
                              onChange={(e) =>
                                handleStatusChange(
                                  order._id,
                                  shopOrder._id,
                                  e.target.value,
                                )
                              }
                              disabled={updatingOrder === shopOrder._id}
                              className={`px-3 py-2 rounded-lg border text-sm font-semibold outline-none cursor-pointer disabled:opacity-50 ${getStatusStyles(
                                shopOrder.status,
                              )}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">
                                Out for Delivery
                              </option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        {updatingOrder === shopOrder._id && (
                          <p className="text-sm text-orange-600 mt-2">
                            Updating status...
                          </p>
                        )}
                      </div>

                      {/* Food Items */}
                      <div className="space-y-3">
                        {shopOrder.shopOrderItems?.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between gap-4 p-4 bg-[#fffaf5] rounded-xl"
                          >
                            <div>
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

                      {/* Available Delivery Boys */}
                      {showDeliveryBoysFor === shopOrder._id &&
                        shopOrder.status === "Out for Delivery" && (
                          <div className="mt-5 p-5 bg-orange-50 rounded-xl border border-orange-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                              Available Delivery Boys
                            </h3>

                            {availableBoys.length === 0 ? (
                              <p className="text-gray-600">
                              No delivery partners are currently available in your delivery area. Please try again shortly. 
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableBoys.map((boy) => (
                                  <div
                                    key={boy.id}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FaUser className="text-orange-500" />

                                      <h4 className="font-bold text-gray-800">
                                        {boy.fullName}
                                      </h4>
                                    </div>

                                    <p className="text-sm text-shadow-black mt-2 flex items-center gap-2">
                                      <FaPhone className="text-orange-500" />
                                      {boy.mobile || "Not available"}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                      <FaMapMarkerAlt className="text-orange-500 shrink-0" />
                                      <span>
                                        {boy.latitude ?? "Not available"},{" "}
                                        {boy.longitude ?? "Not available"}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="px-5 sm:px-6 py-5 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <FaLocationDot className="text-orange-500 mt-1" />

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Delivery Address
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {order.deliveryAddress?.text || "Address unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                  <FaCreditCard className="text-orange-500" />

                  {order.paymentMethod === "cod"
                    ? "Customer will pay on delivery"
                    : "Online payment selected"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerOrders;
