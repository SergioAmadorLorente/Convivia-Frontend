import { initializeApp } from "firebase/app";

import { initializeAuth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCH0zl5Nv_QRoXqSVotslyHdVDaRsED5Kw",
    authDomain: "convivia-862f2.firebaseapp.com",
    projectId: "convivia-862f2",
    storageBucket: "convivia-862f2.firebasestorage.app",
    messagingSenderId: "232954767698",
    appId: "1:232954767698:web:4d1838e4604b74f696b28b",
    measurementId: "G-VX2QNMQ6Z3",
};
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
