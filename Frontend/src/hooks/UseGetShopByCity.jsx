import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setshopsInMyCity } from "../redux/userSlice";

function useGetShopByCity(city) {

  const dispatch = useDispatch();

  useEffect(() => {

    const fetchShops = async () => {
      try {

        if (!city) return;

        const result = await axios.get(
          `${serverUrl}/api/shop/by-city/${city}`
        );

        console.log("Hook Shops:", result.data);

        dispatch(setshopsInMyCity(result.data));

      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };

    fetchShops();

  }, [city, dispatch]);

}

export default useGetShopByCity;