import api from "./api";

export const productosAPI = {
  getAll:          (params) => api.get("/products", { params }),
  getById:         (id) => api.get(`/products/${id}`),
  getFeatured:     () => api.get("/products", { params: { active: true, isFeatured: true } }),
  create:          (data) => api.post("/products", data),
  update:          (id, data) => api.put(`/products/${id}`, data),
  delete:          (id) => api.delete(`/products/${id}`),
  toggleStatus:    (id) => api.patch(`/products/${id}/toggle-status`),
  toggleUsd:       (id) => api.patch(`/products/${id}/toggle-usd`),
  toggleExclusive: (id) => api.patch(`/products/${id}/toggle-exclusive`),
  toggleFeatured:  (id) => api.patch(`/products/${id}/toggle-featured`),
  restoreStock:    (id, quantity) => api.post(`/products/${id}/restore-stock`, { quantity }),
  checkStock:      (id, quantity) => api.post(`/products/${id}/check-stock`, { quantity }),
  
  // ✅ NUEVOS: métodos para stock por variante
  checkStockVariante: (id, { talle, color, quantity }) => 
    api.post(`/products/${id}/check-stock`, { talle, color, quantity }),
  
  reduceStockVariante: (id, { talle, color, quantity }) => 
    api.patch(`/products/${id}/reduce-stock`, { talle, color, quantity }),
  
  restoreStockVariante: (id, { talle, color, quantity }) => 
    api.post(`/products/${id}/restore-stock`, { talle, color, quantity }),
};