import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from "react-redux"; 
import { useSelector } from "react-redux"; 
import { setUserData,setCurrentCity,setCurrentState, setCurrentAddress } from "../redux/userSlice";


function useGetCity() {
  const dispatch = useDispatch();
  const {userData} = useSelector((state) => state.user);
  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      console.log(latitude, longitude);
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_APIKEY}`)
      // dispatch(setCity(result.data));
      console.log("CITY DATA:", result.data);
      console.log(result.data.results[0].city);
      dispatch(setCurrentCity(result.data.results[0].city));
      dispatch(setCurrentState(result.data.results[0].state));
      dispatch(setCurrentAddress(result.data.results[0].formatted));
      console.log(result.data.results[0].state);
      console.log("STATE DATA:", result.data);
      console.log(result.data.results[0].formatted);
      console.log("ADDRESS DATA:", result.data);
    },
    (error) => {
      console.log("Location error:", error);
    }
  );
}, [userData]);
}

export default useGetCity;