
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaUtensils, FaLocationDot } from "react-icons/fa6";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";

function CreateEditShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);

  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(
    myShopData?.address || currentAddress || ""
  );
  const [city, setCity] = useState(
    myShopData?.city || currentCity || ""
  );
  const [state, setState] = useState(
    myShopData?.state || currentState || ""
  );

  const [frontendImage, setFrontendImage] = useState(
    myShopData?.image || null
  );
  const [backendImage, setBackendImage] = useState(null);

  // Restaurant GPS coordinates
  const [latitude, setLatitude] = useState(
    myShopData?.location?.latitude ?? null
  );
  const [longitude, setLongitude] = useState(
    myShopData?.location?.longitude ?? null
  );

  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const serverUrl = "https://vingo-backend-ghyw.onrender.com";

  // Handle restaurant image
  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // Fetch restaurant's current GPS location
  const getRestaurantLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLocationLoading(true);
    setMessage({ type: "", text: "" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);

        setMessage({
          type: "success",
          text: "Restaurant GPS location captured successfully.",
        });
      },
      (error) => {
        console.error("GET RESTAURANT LOCATION ERROR:", error);

        let errorMessage = "Unable to get location.";

        if (error.code === 1) {
          errorMessage =
            "Location permission denied. Please allow location access.";
        } else if (error.code === 2) {
          errorMessage = "Your current location is unavailable.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again.";
        }

        setMessage({
          type: "error",
          text: errorMessage,
        });

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Save or update restaurant
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in all restaurant details.",
      });
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage({
        type: "error",
        text: "Please capture the restaurant GPS location before saving.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("city", city.trim());
      formData.append("state", state.trim());
      formData.append("address", address.trim());

      // Send GPS coordinates to backend
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        {
          withCredentials: true,
        }
      );

      // Support APIs returning either { shop: {...} } or the shop directly
      const savedShop = result.data.shop || result.data;

      dispatch(setMyShopData(savedShop));

      setMessage({
        type: "success",
        text: result.data.message || "Restaurant saved successfully!",
      });

      console.log("SHOP RESPONSE:", result.data);
    } catch (error) {
      console.error("CREATE/EDIT SHOP ERROR:", error);
      console.error("RESPONSE:", error.response?.data);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to save restaurant. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Fill default address details for a new restaurant
  useEffect(() => {
    if (!myShopData) {
      setCity(currentCity || "");
      setState(currentState || "");
      setAddress(currentAddress || "");
    }
  }, [currentCity, currentState, currentAddress, myShopData]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-linear-to-br from-orange-50 to-white p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-3xl text-[#ff4d2d]"
        aria-label="Go back"
      >
        <IoMdArrowRoundBack size={35} />
      </button>

      <div className="w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-orange-100 p-4">
            <FaUtensils className="h-16 w-16 text-[#ff4d2d]" />
          </div>

          <h1 className="text-center text-2xl font-extrabold text-gray-800">
            {myShopData ? "Edit Your Restaurant" : "Add Your Restaurant"}
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Restaurant name */}
          <div>
            <label
              className="mb-2 block font-semibold text-gray-700"
              htmlFor="shopName"
            >
              Restaurant Name
            </label>

            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
              id="shopName"
              name="shopName"
              placeholder="Enter your restaurant name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Restaurant image */}
          <div>
            <label
              className="mb-2 block font-semibold text-gray-700"
              htmlFor="shopImage"
            >
              Restaurant Image
            </label>

            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="file"
              id="shopImage"
              name="shopImage"
              accept="image/*"
              onChange={handleImage}
            />

            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt="Restaurant preview"
                  className="h-48 w-full rounded-lg border object-cover"
                />
              </div>
            )}
          </div>

          {/* City and state */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block font-semibold text-gray-700"
                htmlFor="shopCity"
              >
                City
              </label>

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                type="text"
                id="shopCity"
                name="shopCity"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block font-semibold text-gray-700"
                htmlFor="shopState"
              >
                State
              </label>

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                type="text"
                id="shopState"
                name="shopState"
                placeholder="Enter your state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Restaurant address */}
          <div>
            <label
              className="mb-2 block font-semibold text-gray-700"
              htmlFor="shopAddress"
            >
              Restaurant Address
            </label>

            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
              id="shopAddress"
              name="shopAddress"
              placeholder="Enter your restaurant address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Restaurant GPS location */}
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                <FaLocationDot className="text-xl text-[#ff4d2d]" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Restaurant GPS Location
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Capture the restaurant's actual location for delivery
                  distance calculation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={getRestaurantLocation}
              disabled={locationLoading}
              className="mt-4 w-full rounded-lg bg-[#ff4d2d] px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading
                ? "Fetching Location..."
                : latitude !== null && longitude !== null
                ? "Update GPS Location"
                : "Get Restaurant Location"}
            </button>

            {latitude !== null && longitude !== null && (
              <div className="mt-3 break-all rounded-lg border border-orange-100 bg-white p-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Latitude:</span> {latitude}
                </p>

                <p className="mt-1">
                  <span className="font-semibold">Longitude:</span> {longitude}
                </p>
              </div>
            )}
          </div>

          {/* Success or error message */}
          {message.text && (
            <div
              role="status"
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={saving || locationLoading}
            className="w-full cursor-pointer rounded-lg bg-[#ff4d2d] px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : myShopData
              ? "Update Restaurant"
              : "Save Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
