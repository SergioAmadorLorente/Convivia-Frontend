// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCH0zl5Nv_QRoXqSVotslyHdVDaRsED5Kw",
    authDomain: "convivia-862f2.firebaseapp.com",
    projectId: "convivia-862f2",
    storageBucket: "convivia-862f2.firebasestorage.app",
    messagingSenderId: "232954767698",
    appId: "1:232954767698:web:4d1838e4604b74f696b28b",
    measurementId: "G-VX2QNMQ6Z3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)