import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import LiveTrackingMap from "./LiveTrackingMap";

import {
  FaLocationDot,
  FaBoxOpen,
  FaMotorcycle,
  FaCheck,
  FaRotate,
  FaClock,
  FaPhone,
  FaClipboardCheck,
  FaWallet,
  FaChartLine,
} from "react-icons/fa6";

import { ImSpinner8 } from "react-icons/im";

function DeliveryBoy() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [error, setError] = useState("");
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [acceptedLoading, setAcceptedLoading] = useState(true);
  const [acceptedError, setAcceptedError] = useState("");
  const [otpValues, setOtpValues] = useState({});
  const [verifyingAssignment, setVerifyingAssignment] = useState(null);
  const [otpMessages, setOtpMessages] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // Get current delivery boy location
  // Live location tracking for accepted deliveries
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    let watchId = null;
    let isActive = true;

    const startTracking = () => {
      if (watchId !== null || !isActive) return;

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          if (!isActive) return;

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setLocation({ latitude, longitude });

          // Send current location for each active assignment
          const activeAssignments = acceptedOrders.filter(
            (order) => order.status === "Out for Delivery",
          );

          for (const order of activeAssignments) {
            try {
              const response = await axios.post(
                `${serverUrl}/api/delivery/update-location/${order.assignmentId}`,
                { latitude, longitude },
                { withCredentials: true },
              );

              console.log(
                `Location updated for assignment ${order.assignmentId}:`,
                response.data.distanceInMetres,
                "metres from customer",
              );
            } catch (error) {
              console.error(
                "DELIVERY LOCATION UPDATE ERROR:",
                error.response?.data?.message || error.message,
              );
            }
          }
        },
        (error) => {
          console.error("GEOLOCATION ERROR:", error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        },
      );
    };

    startTracking();

    return () => {
      isActive = false;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [acceptedOrders]);

  // Fetch logged-in user
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/auth/current`, {
        withCredentials: true,
      });

      setUser(response.data.user || response.data);
    } catch (err) {
      console.error("FETCH USER ERROR:", err);
    }
  };

  // Fetch available delivery orders
  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${serverUrl}/api/delivery/available-orders`,
        { withCredentials: true },
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("FETCH AVAILABLE ORDERS ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to load available orders.",
      );
    } finally {
      setLoading(false);
    }
  };
  // Accepted orders
  const fetchAcceptedOrders = async () => {
    try {
      setAcceptedLoading(true);
      setAcceptedError("");

      const response = await axios.get(
        `${serverUrl}/api/delivery/my-accepted-orders`,
        { withCredentials: true },
      );

      setAcceptedOrders(response.data.orders || []);
    } catch (err) {
      console.error("FETCH ACCEPTED ORDERS ERROR:", err);

      setAcceptedError(
        err.response?.data?.message || "Unable to load accepted orders.",
      );
    } finally {
      setAcceptedLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await axios.get(`${serverUrl}/api/delivery/dashboard`, {
        withCredentials: true,
      });

      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error("FETCH DELIVERY DASHBOARD ERROR:", error);

      setDashboardError(
        error.response?.data?.message || "Unable to load earnings dashboard.",
      );
    } finally {
      setDashboardLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
    fetchAvailableOrders();
    fetchAcceptedOrders();
    fetchDashboard();
  }, []);
  // Accept delivery assignment
  const handleAcceptOrder = async (assignmentId) => {
    try {
      setAcceptingOrder(assignmentId);

      const response = await axios.post(
        `${serverUrl}/api/delivery/accept/${assignmentId}`,
        {},
        { withCredentials: true },
      );

      // alert(response.data.message || "Order accepted successfully!");

      await Promise.all([fetchAvailableOrders(), fetchAcceptedOrders()]);
    } catch (err) {
      console.error("ACCEPT ORDER ERROR:", err);

      alert(err.response?.data?.message || "Unable to accept this order.");
    } finally {
      setAcceptingOrder(null);
    }
  };

  // Verify the customer's delivery OTP
  const handleVerifyOtp = async (assignmentId) => {
    const otp = otpValues[assignmentId] || "";

    if (!/^\d{6}$/.test(otp)) {
      setOtpMessages((prev) => ({
        ...prev,
        [assignmentId]: {
          type: "error",
          text: "Please enter a valid 6-digit OTP.",
        },
      }));
      return;
    }

    try {
      setVerifyingAssignment(assignmentId);
      setOtpMessages((prev) => ({ ...prev, [assignmentId]: null }));

      const response = await axios.post(
        `${serverUrl}/api/delivery/verify-otp/${assignmentId}`,
        { otp },
        { withCredentials: true },
      );

      setOtpMessages((prev) => ({
        ...prev,
        [assignmentId]: {
          type: "success",
          text: response.data.message || "Delivery verified successfully!",
        },
      }));

      setOtpValues((prev) => ({ ...prev, [assignmentId]: "" }));

      await fetchAcceptedOrders();
    } catch (err) {
      setOtpMessages((prev) => ({
        ...prev,
        [assignmentId]: {
          type: "error",
          text: err.response?.data?.message || "Unable to verify OTP.",
        },
      }));
    } finally {
      setVerifyingAssignment(null);
    }
  };

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#fffaf7] text-gray-800">
      {/* Navbar */}
      {/* <nav className="ml-320">
        <button
          onClick={fetchAvailableOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-100 bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 transition disabled:opacity-50"
        >
          <FaRotate className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh Orders</span>
        </button>
      </nav> */}

      {/* Main */}
      <main className="max-w-4xl mx-auto px-5 py-8 sm:py-12">
        {/* Welcome */}
        <section className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 text-[#ff4d2d] mb-4">
            <FaMotorcycle className="text-3xl" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user?.fullName || user?.name || "Delivery Partner"}!
          </h2>

          <p className="text-gray-500 mt-2">
            Ready to deliver happiness today?
          </p>
        </section>

        {/* Earnings Dashboard */}
        <section className="mb-6">
          <div className="mb-4">
            <h3 className="text-2xl font-extrabold text-gray-900">
              Earnings Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Track your deliveries and earnings.
            </p>
          </div>

          {dashboardLoading ? (
            <div className="flex justify-center rounded-2xl border border-orange-100 bg-white p-8">
              <ImSpinner8 className="animate-spin text-3xl text-[#ff4d2d]" />
            </div>
          ) : dashboardError ? (
            <div className="rounded-2xl border border-red-100 bg-white p-5">
              <p className="text-sm text-red-600">{dashboardError}</p>

              <button
                type="button"
                onClick={fetchDashboard}
                className="mt-3 rounded-lg bg-[#ff4d2d] px-4 py-2 font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : dashboard ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Today's Earnings */}
                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Today's Earnings
                      </p>

                      <h4 className="mt-2 text-3xl font-extrabold text-gray-900">
                        ₹{dashboard.todayEarnings}
                      </h4>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FaWallet className="text-xl" />
                    </div>
                  </div>
                </div>

                {/* Today's Deliveries */}
                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Today's Deliveries
                      </p>

                      <h4 className="mt-2 text-3xl font-extrabold text-gray-900">
                        {dashboard.todayDeliveries}
                      </h4>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#ff4d2d]">
                      <FaClipboardCheck className="text-xl" />
                    </div>
                  </div>
                </div>

                {/* Active Deliveries */}
                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Active Deliveries
                      </p>

                      <h4 className="mt-2 text-3xl font-extrabold text-gray-900">
                        {dashboard.activeDeliveries}
                      </h4>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FaMotorcycle className="text-xl" />
                    </div>
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Earnings
                      </p>

                      <h4 className="mt-2 text-3xl font-extrabold text-gray-900">
                        ₹{dashboard.totalEarnings}
                      </h4>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <FaChartLine className="text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {dashboard.missingLocationCount > 0 && (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  {dashboard.missingLocationCount} completed delivery
                  {dashboard.missingLocationCount > 1 ? "ies" : ""} could not be
                  included in earnings because GPS coordinates are missing.
                  Please update the restaurant location.
                </p>
              )}

              {/* Recent delivery history */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 p-5">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Completed Deliveries
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      Your delivery history and earnings.
                    </p>
                  </div>

                  <FaClock className="text-xl text-[#ff4d2d]" />
                </div>

                {dashboard.deliveryHistory.length === 0 ? (
                  <p className="p-6 text-center text-sm text-gray-500">
                    No completed deliveries yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {dashboard.deliveryHistory.slice(0, 10).map((delivery) => (
                      <div
                        key={delivery.assignmentId}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {delivery.shopName || "Restaurant"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Order ID: {String(delivery.orderId).slice(-8)}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {delivery.distanceInKm === null
                              ? "Distance unavailable"
                              : `${delivery.distanceInKm} km`}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(delivery.completedAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-lg font-extrabold text-green-600">
                            {delivery.earning === null
                              ? "Pending calculation"
                              : `₹${delivery.earning}`}
                          </p>

                          <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Delivered
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={fetchDashboard}
                className="mt-4 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-[#ff4d2d] transition hover:bg-orange-50"
              >
                <FaRotate className="mr-2 inline" />
                Refresh Earnings
              </button>
            </>
          ) : null}
        </section>
        {/* Location Card */}
        <section className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
              <FaLocationDot className="text-[#ff4d2d] text-xl" />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Your Current Location</h3>

              <p className="text-sm text-gray-500">
                Used to find nearby delivery orders
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#fff8f3] border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Latitude</p>

              <p className="font-semibold text-gray-800 break-all">
                {location.latitude ?? "Location unavailable"}
              </p>
            </div>

            <div className="bg-[#fff8f3] border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Longitude</p>

              <p className="font-semibold text-gray-800 break-all">
                {location.longitude ?? "Location unavailable"}
              </p>
            </div>
          </div>
        </section>

        {/* Available Orders */}
        <section className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Available Orders
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Orders available for delivery
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <FaBoxOpen className="text-[#ff4d2d] text-xl" />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Loading */}
            {loading && (
              <div className="py-10 flex flex-col items-center">
                <ImSpinner8 className="text-3xl text-orange-500 animate-spin" />

                <p className="text-gray-500 mt-3">
                  Loading available orders...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                <p className="text-red-600">{error}</p>

                <button
                  onClick={fetchAvailableOrders}
                  className="mt-4 px-5 py-2 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-orange-600"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && orders.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
                  <FaBoxOpen className="text-3xl text-orange-400" />
                </div>

                <h4 className="font-bold text-gray-800 mt-4">
                  No Available Orders
                </h4>

                <p className="text-sm text-gray-500 mt-2">
                  New delivery requests will appear here when available.
                </p>

                <button
                  onClick={fetchAvailableOrders}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4d2d] text-white font-semibold hover:bg-orange-600 transition"
                >
                  <FaRotate />
                  Refresh
                </button>
              </div>
            )}

            {/* Order Cards */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-5">
                {orders.map((order) => (
                  <div
                    key={order.assignmentId || order._id}
                    className="border border-gray-200 rounded-2xl p-5 hover:border-orange-200 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                          <FaBoxOpen />
                          New Delivery
                        </span>

                        <h4 className="text-lg font-bold text-gray-900 mt-3">
                          {order.shopName ||
                            order.shop?.name ||
                            "Restaurant Order"}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          Order ID: {order.orderId || order._id || "N/A"}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-[#ff4d2d] whitespace-nowrap">
                        {formatPrice(order.subTotal ?? order.totalAmount)}
                      </p>
                    </div>

                    {/* Pickup */}
                    <div className="mt-5 flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
                        <FaLocationDot className="text-orange-500" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Pickup Location
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {order.shopAddress ||
                            order.shop?.address ||
                            "Pickup address unavailable"}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-4 flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-green-50 flex items-center justify-center">
                        <FaMotorcycle className="text-green-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Deliver To
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {order.deliveryAddress?.text ||
                            order.deliveryAddress ||
                            "Delivery address unavailable"}
                        </p>
                      </div>
                    </div>

                    {/* Customer */}
                    {order.customerName && (
                      <div className="mt-4 flex items-center gap-3">
                        <FaPhone className="text-orange-500" />

                        <p className="text-sm text-gray-600">
                          {order.customerName}
                          {order.customerMobile
                            ? ` · ${order.customerMobile}`
                            : ""}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    {order.items?.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-sm text-gray-800 mb-2">
                          Order Items
                        </p>

                        {order.items.map((item, index) => (
                          <div
                            key={item._id || index}
                            className="flex justify-between gap-3 text-sm text-gray-600 py-1"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>

                            <span>
                              {formatPrice(
                                Number(item.price) * Number(item.quantity),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Accept */}
                    <button
                      onClick={() =>
                        handleAcceptOrder(order.assignmentId || order._id)
                      }
                      disabled={
                        acceptingOrder === (order.assignmentId || order._id)
                      }
                      className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ff4d2d] text-white font-bold hover:bg-orange-600 transition disabled:opacity-60"
                    >
                      {acceptingOrder === (order.assignmentId || order._id) ? (
                        <>
                          <ImSpinner8 className="animate-spin" />
                          Accepting Order...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Accept Order
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* My Accepted Orders */}
        <section className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden mt-6">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                My Accepted Orders
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Orders assigned to you for delivery
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <FaClipboardCheck className="text-green-600 text-xl" />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {acceptedLoading ? (
              <div className="py-8 flex justify-center">
                <ImSpinner8 className="text-3xl text-orange-500 animate-spin" />
              </div>
            ) : acceptedError ? (
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-red-600">{acceptedError}</p>

                <button
                  onClick={fetchAcceptedOrders}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#ff4d2d] text-white"
                >
                  Try Again
                </button>
              </div>
            ) : acceptedOrders.length === 0 ? (
              <div className="py-8 text-center">
                <FaBoxOpen className="text-3xl text-gray-300 mx-auto" />

                <h4 className="font-semibold text-gray-800 mt-3">
                  No Accepted Orders
                </h4>

                <p className="text-sm text-gray-500 mt-2">
                  Orders you accept will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {acceptedOrders.map((order) => (
                  <div
                    key={order.assignmentId}
                    className="border border-green-200 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                          <FaCheck />
                          Order Accepted
                        </span>

                        <h4 className="text-lg font-bold text-gray-900 mt-3">
                          {order.shopName}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          Order ID: {order.orderId}
                        </p>
                      </div>

                      <p className="font-bold text-[#ff4d2d]">
                        {formatPrice(order.subTotal ?? order.totalAmount)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-800">
                        <FaLocationDot className="inline text-orange-500 mr-2" />
                        Pickup Location
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {order.shopAddress || "Pickup address unavailable"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-800">
                        <FaMotorcycle className="inline text-green-600 mr-2" />
                        Delivery Address
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {order.deliveryAddress?.text ||
                          order.deliveryAddress ||
                          "Delivery address unavailable"}
                      </p>
                    </div>

                    {order.items?.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-sm mb-2">
                          Order Items
                        </p>

                        {order.items.map((item, index) => (
                          <div
                            key={item._id || index}
                            className="flex justify-between gap-3 text-sm text-gray-600 py-1"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>

                            <span>
                              {formatPrice(
                                Number(item.price) * Number(item.quantity),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 bg-green-50 text-green-700 rounded-xl p-3 text-sm font-semibold">
                      Status: {order.status || "Out for Delivery"}
                    </div>

                    {/* Live map for this active delivery */}
                    {order.status === "Out for Delivery" && (
                      <div className="mt-5">
                        <LiveTrackingMap
                          serverUrl={serverUrl}
                          assignmentId={order.assignmentId}
                          customerLocation={
                            order.deliveryAddress &&
                            typeof order.deliveryAddress === "object"
                              ? {
                                  latitude: order.deliveryAddress.latitude,
                                  longitude: order.deliveryAddress.longitude,
                                }
                              : null
                          }
                          initialDeliveryBoyLocation={location}
                        />
                      </div>
                    )}

                    {order.status === "Out for Delivery" && (
                      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <label
                          htmlFor={`otp-${order.assignmentId}`}
                          className="block text-sm font-semibold text-gray-800 mb-2"
                        >
                          Customer Delivery OTP
                        </label>

                        <input
                          id={`otp-${order.assignmentId}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={otpValues[order.assignmentId] || ""}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setOtpValues((prev) => ({
                              ...prev,
                              [order.assignmentId]: value,
                            }));
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                          Ask the customer for the OTP when the order arrives.
                        </p>

                        <button
                          type="button"
                          onClick={() => handleVerifyOtp(order.assignmentId)}
                          disabled={
                            verifyingAssignment === order.assignmentId ||
                            (otpValues[order.assignmentId] || "").length !== 6
                          }
                          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-[#ff4d2d] px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {verifyingAssignment === order.assignmentId ? (
                            <>
                              <ImSpinner8 className="animate-spin" />
                              Verifying OTP...
                            </>
                          ) : (
                            <>
                              <FaClipboardCheck />
                              Verify OTP & Complete Delivery
                            </>
                          )}
                        </button>

                        {otpMessages[order.assignmentId]?.text && (
                          <p
                            role="status"
                            className={`mt-3 text-sm ${
                              otpMessages[order.assignmentId].type === "success"
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            {otpMessages[order.assignmentId].text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Vingo Delivery Partner Dashboard
        </p>
      </main>
    </div>
  );
}

export default DeliveryBoy;
