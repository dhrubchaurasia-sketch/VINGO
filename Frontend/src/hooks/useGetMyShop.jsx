
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
// import { setUserData } from "../redux/userSlice";
import { setMyShopData } from "../redux/ownerSlice";

function useGetMyShop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`,
          {
            withCredentials: true,
          }
        );

        console.log("Hook Shop:", result.data);

        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    fetchShop();
  }, []);
}

export default useGetMyShop;

