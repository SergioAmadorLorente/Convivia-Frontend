import axios from "axios";
import { Platform } from "react-native";

// Configuration for API URL
// NOTE: For Android Emulator, use '10.0.2.2' instead of 'localhost'.
// NOTE: For physical devices, use your computer's local LAN IP (e.g., 192.168.1.X).
// WARNING: Self-signed HTTPS certificates often fail on Android/iOS without extra config.
// If you get Network Error, try using HTTP on port 5273 (if available) or configure your device to trust the certificate.

const ANDROID_URL = "https://pbbtmgfm-5082.uks1.devtunnels.ms/api";
const IOS_WEB_URL = "https://pbbtmgfm-5082.uks1.devtunnels.ms/api";

const getBaseUrl = () => {
  if (Platform.OS === "android") {
    return ANDROID_URL;
  }
  return IOS_WEB_URL;
};

// Centralized Axios instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  // Removed validateStatus to properly handle HTTP errors
});

api.interceptors.request.use((request) => {
  console.log("Starting Request", request.method, request.baseURL, request.url);
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 404) {
      console.warn("API Resource Not Found (404):", {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error("Axios Error:", {
        message: error.message,
        code: error.code,
        status: status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
