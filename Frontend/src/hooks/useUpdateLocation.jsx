import axios from "axios";
import { useCallback, useState } from "react";
import { serverUrl } from "../App";

function useUpdateLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Geolocation is not supported by your browser.";

        setError(message);
        reject(new Error(message));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log("Latitude:", lat);
            console.log("Longitude:", lon);

            const result = await axios.post(
              `${serverUrl}/api/user/update-location`,
              { lat, lon },
              { withCredentials: true },
            );

            console.log("Backend response:", result.data);

            resolve(result.data);
          } catch (err) {
            console.error("Location update error:", err);

            const message =
              err.response?.data?.message || "Failed to update location.";

            setError(message);
            reject(err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          let message;

          if (err.code === 1) {
            message =
              "Location permission denied. Please allow location access.";
          } else if (err.code === 2) {
            message = "Your location is currently unavailable.";
          } else {
            message = "Location request timed out.";
          }

          console.error("Geolocation error:", message);

          setError(message);
          setLoading(false);

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  return {
    updateLocation,
    loading,
    error,
  };
}

export default useUpdateLocation;
