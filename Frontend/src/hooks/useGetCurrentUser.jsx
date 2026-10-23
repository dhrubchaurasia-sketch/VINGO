import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from "react-redux";  
import { setUserData } from "../redux/userSlice";


function useGetCurrentUser() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/auth/current`, { withCredentials: true });
        // console.log("Hook User:", result.data); 
        dispatch(setUserData(result.data));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, []);
}

export default useGetCurrentUser;