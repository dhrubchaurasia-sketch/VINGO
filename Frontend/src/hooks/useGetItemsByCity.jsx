import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setitemsInMyCity } from "../redux/userSlice";

function useGetItemsByCity(city) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!city) return;

        const result = await axios.get(
          `${serverUrl}/api/items/get-items-by-city/${city}`,
          {
            withCredentials: true,
          }
        );

        console.log("Hook Items:", result.data);

        dispatch(setitemsInMyCity(result.data));
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [city, dispatch]);
}

export default useGetItemsByCity;