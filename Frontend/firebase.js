// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "vingo-food-delivery-ef2c7.firebaseapp.com",
  projectId: "vingo-food-delivery-ef2c7",
  storageBucket: "vingo-food-delivery-ef2c7.firebasestorage.app",
  messagingSenderId: "106730497643",
  appId: "1:106730497643:web:ac7df96530c9b976c1332e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app,auth} 