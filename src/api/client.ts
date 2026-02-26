import axios from "axios";
import { Platform } from "react-native";
import { API_CONFIG } from "../configs/apiConfig";

const getBaseUrl = () => {
  if (Platform.OS === "android") {
    return API_CONFIG.ANDROID_URL;
  }
  return API_CONFIG.IOS_WEB_URL;
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
      /*/ console.error("Axios Error:", {
        message: error.message,
        code: error.code,
        status: status,
        data: error.response?.data,
      });*/
    }
    return Promise.reject(error);
  },
);
// exportar para usar en toda la app
export default api;
