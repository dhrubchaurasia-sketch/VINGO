import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import deliveryBoyImage from "../assets/delivery-boy.png";

//  Custom Delivery Boy Icon
const deliveryBoyIcon = L.icon({
  iconUrl: deliveryBoyImage,
  iconSize: [45, 45],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

//  Normal Customer Location Icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

//  Update Map Position
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

export default function LiveTrackingMap({
  serverUrl = "https://vingo-backend-ghyw.onrender.com",
  assignmentId,
  customerLocation,
  initialDeliveryBoyLocation = null,
}) {
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(() => {
    const lat = Number(initialDeliveryBoyLocation?.latitude);
    const lng = Number(initialDeliveryBoyLocation?.longitude);

    return initialDeliveryBoyLocation?.latitude != null &&
      initialDeliveryBoyLocation?.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
      ? [lat, lng]
      : null;
  });

  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [error, setError] = useState("");

  // Update initial delivery boy location when it changes
  useEffect(() => {
    const lat = Number(initialDeliveryBoyLocation?.latitude);
    const lng = Number(initialDeliveryBoyLocation?.longitude);

    if (
      initialDeliveryBoyLocation?.latitude != null &&
      initialDeliveryBoyLocation?.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      setDeliveryBoyLocation([lat, lng]);
      setLastUpdated(new Date().toISOString());
    }
  }, [
    initialDeliveryBoyLocation?.latitude,
    initialDeliveryBoyLocation?.longitude,
  ]);

  // 🔴 Socket.IO Live Tracking
  useEffect(() => {
    if (!assignmentId) {
      setConnectionStatus("Waiting for assignment");
      return;
    }

    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setConnectionStatus("Connected");
      setError("");

      console.log("Live tracking socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      setConnectionStatus("Disconnected");
      setError(err.message);

      console.error("Tracking socket error:", err.message);
    });

    socket.on("delivery-location-updated", (data) => {
      if (String(data.assignmentId) !== String(assignmentId)) {
        return;
      }

      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return;
      }

      setDeliveryBoyLocation([latitude, longitude]);

      setLastUpdated(data.updatedAt || new Date().toISOString());

      setError("");
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl, assignmentId]);

  // Validate customer coordinates
  const validCustomerLocation =
    customerLocation &&
    customerLocation.latitude != null &&
    customerLocation.longitude != null &&
    Number.isFinite(Number(customerLocation.latitude)) &&
    Number.isFinite(Number(customerLocation.longitude)) &&
    Number(customerLocation.latitude) >= -90 &&
    Number(customerLocation.latitude) <= 90 &&
    Number(customerLocation.longitude) >= -180 &&
    Number(customerLocation.longitude) <= 180;

  if (!validCustomerLocation) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        Customer delivery coordinates are unavailable in this order response.
      </div>
    );
  }

  const customerPosition = [
    Number(customerLocation.latitude),
    Number(customerLocation.longitude),
  ];

  const center = deliveryBoyLocation || customerPosition;

  const routePoints = deliveryBoyLocation
    ? [deliveryBoyLocation, customerPosition]
    : [customerPosition];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Live Delivery Tracking
          </h2>

          <p className="text-sm text-gray-500">
            {deliveryBoyLocation
              ? "Your delivery partner and destination are shown on the map."
              : "Waiting for delivery partner GPS..."}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            connectionStatus === "Connected"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {connectionStatus}
        </span>
      </div>

      {/* Connection Error */}
      {error && (
        <p className="px-4 pb-3 text-sm text-red-600">
          Connection issue: {error}
        </p>
      )}

      {/* Map */}
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          height: "420px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater position={center} />

        {/* 🛵 Delivery Boy Custom Icon */}
        {deliveryBoyLocation && (
          <Marker position={deliveryBoyLocation} icon={deliveryBoyIcon}>
            <Popup>
              <div className="text-center">
                <strong>🛵 Your Delivery Partner</strong>
                <br />
                Live location
              </div>
            </Popup>
          </Marker>
        )}

        {/* 🏠 Customer Location */}
        <Marker position={customerPosition} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <strong>🏠 Customer Location</strong>
              <br />
              Delivery destination
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        {deliveryBoyLocation && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: "blue",
              weight: 4,
              opacity: 0.7,
              dashArray: "8 8",
            }}
          />
        )}
      </MapContainer>

      {/* Tracking Information */}
      <div className="p-4 text-sm text-gray-600">
        <p>
          <strong>Delivery Partner:</strong>{" "}
          {deliveryBoyLocation ? "Location available" : "Waiting for GPS"}
        </p>

        <p className="mt-1">
          <strong>Last updated:</strong>{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Not yet"}
        </p>
      </div>
    </div>
  );
}
