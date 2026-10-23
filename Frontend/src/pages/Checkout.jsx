import React, { useState, useEffect } from "react";
import { FaSearch, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { IoArrowBack } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { MdMyLocation } from "react-icons/md";
import { SiPhonepe } from "react-icons/si";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Leaflet Marker Icon
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Move map when selected coordinates change
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, { duration: 0.5 });
  }, [position, map]);

  return null;
}

// Map marker and location selection
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

function Checkout() {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState([22.2851, 73.3635]);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const { cartItems, currentAddress } = useSelector((state) => state.user);

  // Convert coordinates into a readable address
  const reverseGeocode = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Could not retrieve address for this location.");
    }

    const result = await response.json();

    if (result.display_name) {
      setAddress(result.display_name);
    } else {
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  // Update address when map location changes
  const handleMapLocationSelect = async (newPosition) => {
    setPosition(newPosition);
    setLoadingAddress(true);

    try {
      await reverseGeocode(newPosition[0], newPosition[1]);
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      alert(
        "Pin moved, but the address could not be found. Please try another point or enter the address manually.",
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  // Load saved address from Redux
  useEffect(() => {
    if (currentAddress) {
      if (typeof currentAddress === "string") {
        setAddress(currentAddress);
      } else if (currentAddress?.results?.[0]?.formatted) {
        setAddress(currentAddress.results[0].formatted);
      }
    }
  }, [currentAddress]);

  // Calculate subtotal
  const subtotal = (cartItems || []).reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  // Delivery fee
  const deliveryFee = subtotal > 0 && subtotal + 40 <= 500 ? 40 : 0;

  // Total amount
  const total = subtotal + deliveryFee;

  // Total quantity of items
  const totalItems = (cartItems || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  // Get current device location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        const newPosition = [latitude, longitude];

        setPosition(newPosition);
        setLoadingAddress(true);

        try {
          await reverseGeocode(latitude, longitude);
        } catch (error) {
          console.error("Address fetch error:", error);

          alert(
            "Your location was found, but its address could not be retrieved.",
          );
        } finally {
          setLoadingAddress(false);
          setLoadingLocation(false);
        }
      },

      (error) => {
        console.error("Location error:", error);

        setLoadingLocation(false);

        if (error.code === 1) {
          alert("Please allow location permission in your browser.");
        } else {
          alert("Unable to fetch your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // Search for an address and move the map pin
  const handleSearchAddress = async () => {
    if (!address.trim()) {
      alert("Please enter an address first.");
      return;
    }

    setLoadingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          address,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Address search failed");
      }

      const results = await response.json();

      if (results.length === 0) {
        alert("Address not found. Please try another address.");
        return;
      }

      const latitude = Number(results[0].lat);
      const longitude = Number(results[0].lon);

      setPosition([latitude, longitude]);
      setAddress(results[0].display_name);
    } catch (error) {
      console.error("Address search error:", error);

      alert("Unable to search address. Please try again.");
    } finally {
      setLoadingAddress(false);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert("Please select or enter your delivery address.");
      return;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (placingOrder) return;

    setPlacingOrder(true);

    const deliveryAddress = {
      text: address,
      latitude: position[0],
      longitude: position[1],
    };

    try {
      // CASH ON DELIVERY
      if (paymentMethod === "cod") {
        const response = await axios.post(
          `${serverUrl}/api/order/place-order`,
          {
            cartItems,
            paymentMethod: "cod",
            deliveryAddress,
          },
          { withCredentials: true },
        );

        console.log("COD ORDER RESPONSE:", response.data);

        navigate("/order-placed");
        return;
      }

      // ONLINE PAYMENT: CHECK RAZORPAY SCRIPT
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not load. Please refresh the page and try again.",
        );
      }

      // CREATE RAZORPAY ORDER ON BACKEND
      const response = await axios.post(
        `${serverUrl}/api/order/create-payment-order`,
        {
          cartItems,
          deliveryAddress,
        },
        { withCredentials: true },
      );

      const { keyId, razorpayOrderId, amount, currency } = response.data;

      if (!keyId || !razorpayOrderId || !amount) {
        throw new Error("Unable to initialize Razorpay payment.");
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Vingo",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        theme: {
          color: "#ff4d2d",
        },

        handler: async function (paymentResponse) {
          try {
            setPlacingOrder(true);

            // VERIFY PAYMENT ON BACKEND
            const verifyResponse = await axios.post(
              `${serverUrl}/api/order/verify-payment`,
              {
                ...paymentResponse,
                cartItems,
                deliveryAddress,
              },
              { withCredentials: true },
            );

            console.log("PAYMENT VERIFIED:", verifyResponse.data);

            navigate("/order-placed");
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error.response?.data || error.message,
            );

            alert(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support before trying to pay again.",
            );
          } finally {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("RAZORPAY PAYMENT FAILED:", response.error);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );

        setPlacingOrder(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );

      setPlacingOrder(false);
    }
  };

  // Checkout UI
  return (
    <>
      {/* Back to Cart Button */}
      <button
        type="button"
        onClick={() => navigate("/cart")}
        className="fixed top-4 left-4 z-1000 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-gray-700 shadow-md transition hover:text-orange-500"
      >
        <IoArrowBack size={22} />
      </button>

      <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-orange-50 to-white p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-xl sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Checkout</h2>

            <p className="mt-1 text-sm text-gray-500">Complete your order</p>
          </div>

          {/* Delivery Location */}
          <div className="mb-7">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
              <FaLocationDot className="text-[#ff4d2d]" />
              Delivery Location
            </h4>

            {/* Address Search */}
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchAddress();
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              />

              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={loadingAddress}
                className="rounded-lg bg-[#ff4d2d] p-3 text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                aria-label="Search address"
                title="Search address"
              >
                <FaSearch />
              </button>

              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={loadingLocation || loadingAddress}
                className="rounded-lg bg-blue-500 p-3 text-white transition hover:bg-blue-600 disabled:opacity-60"
                aria-label="Get current location"
                title="Use my current location"
              >
                <MdMyLocation />
              </button>
            </div>

            {/* Interactive Map */}
            <div className="relative z-0 h-52 w-full overflow-hidden rounded-xl border border-gray-300 sm:h-60">
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater position={position} />

                <LocationMarker
                  position={position}
                  onLocationSelect={handleMapLocationSelect}
                />
              </MapContainer>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Click anywhere on the map to move the pin and automatically fill
              the address above.
            </p>

            {loadingAddress && (
              <p className="mt-1 text-xs text-blue-600" role="status">
                Fetching address for the selected location...
              </p>
            )}

            <div className="mt-2 wrap-break-word text-xs text-gray-600">
              <p>Latitude: {position[0].toFixed(6)}</p>
              <p>Longitude: {position[1].toFixed(6)}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-7">
            <h4 className="mb-3 text-sm font-bold text-gray-800">
              Payment Method
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  paymentMethod === "cod"
                    ? "border-[#ff4d2d] bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <FaMoneyBillWave size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Pay when your order arrives
                  </p>
                </div>
              </button>
              {/* Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  paymentMethod === "online"
                    ? "border-[#ff4d2d] bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <SiPhonepe size={20} />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-800">
                    Online Payment
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    UPI / Credit / Debit Card
                  </p>
                </div>

                <FaCreditCard className="shrink-0 text-blue-500" />
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-bold text-gray-800">
              Order Summary
            </h4>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
                <span>Cart Items</span>
                <span>{totalItems} items</span>
              </div>

              {/* Individual Cart Items */}
              {(cartItems || []).map((item, index) => (
                <div
                  key={item.id ?? item._id ?? index}
                  className="mb-3 flex items-center justify-between gap-3 text-xs text-gray-600"
                >
                  <span className="flex-1">
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₹{" "}
                    {(
                      Number(item.price || 0) * Number(item.quantity || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="my-3 border-t border-gray-200" />

              <div className="flex items-center justify-between text-sm font-bold text-[#ff4d2d]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Place Order */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placingOrder || loadingAddress || loadingLocation}
            className="w-full cursor-pointer rounded-lg bg-[#ff4d2d] py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder
              ? "Placing Order..."
              : paymentMethod === "cod"
                ? "Place Order"
                : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </>
  );
}

export default Checkout;
