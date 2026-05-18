import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
// @ts-ignore
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBo0LL8IZQbxfa0dJyu9AUzJNZy_Ud1cUQ",
  authDomain: "resq-a77e9.firebaseapp.com",
  projectId: "resq-a77e9",
  storageBucket: "resq-a77e9.firebasestorage.app",
  messagingSenderId: "991866814936",
  appId: "1:991866814936:web:882b0e0f948caccfeef2ad",
};

const app = initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);
