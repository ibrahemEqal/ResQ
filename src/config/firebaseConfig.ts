import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBo0LL8IZQbxfa0dJyu9AUzJNZy_Ud1cUQ",

  authDomain: "resq-a77e9.firebaseapp.com",

  projectId: "resq-a77e9",

  storageBucket: "resq-a77e9.firebasestorage.app",

  messagingSenderId: "991866814936",

  appId: "1:991866814936:web:882b0e0f948caccfeef2ad",
};

const existingApps = getApps();
const app = existingApps.length === 0 ? initializeApp(firebaseConfig) : getApp();

const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence;

export const auth = existingApps.length === 0
  ? typeof document === 'undefined'
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      })
    : getAuth(app)
  : getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
