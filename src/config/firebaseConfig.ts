import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

    apiKey: "AIzaSyBo0LL8IZQbxfa0dJyu9AUzJNZy_Ud1cUQ",

    authDomain: "resq-a77e9.firebaseapp.com",

    projectId: "resq-a77e9",

    storageBucket: "resq-a77e9.firebasestorage.app",

    messagingSenderId: "991866814936",

    appId: "1:991866814936:web:882b0e0f948caccfeef2ad"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app); 