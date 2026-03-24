import api from "./api";

export const authAPI = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  renewToken: () => api.post("/login/renew-token"),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
  updateAddress: (data) => api.put("/auth/me/address", data),
  deleteAddress: () => api.delete("/auth/me/address"),
  changePassword: (data) => api.post("/auth/change-password", data),
  requestResetPassword: (email) => api.post("/auth/reset-password-request", { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
};