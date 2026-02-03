import axios from "axios";
import { Platform } from "react-native";

const ANDROID_URL = "https://xp5h45z8-7226.uks1.devtunnels.ms/api";
const IOS_WEB_URL = "https://xp5h45z8-7226.uks1.devtunnels.ms/api";

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
    "X-Api-Key": "ConviviaDevelopmentKey2026",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
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
  },
);
// exportar para usar en toda la app
export default api;
