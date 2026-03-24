import axios from "axios";
import { CONFIG } from "../config";

const api = axios.create({
  baseURL: CONFIG.API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: agrega el token si existe ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: maneja token expirado ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response?.data?.error || "";
      if (msg.includes("expirado") || msg.includes("inválido")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;