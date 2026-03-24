import api from "./api";

export const carritoAPI = {
  getActive: (userId) => api.get(`/cart/user/${userId}/active`),
  getByUser: (userId) => api.get(`/cart/user/${userId}`),
  getById: (cartId) => api.get(`/cart/${cartId}`),
  getAll: (params) => api.get("/cart/all", { params }),
  
  // Actualizar add para recibir talle/color
  add: (productId, quantity, variante = {}) => 
    api.post("/cart", { 
      productId, 
      quantity,
      talle: variante.talle || null,
      color: variante.color || null
    }),
  
  updateItem: (cartId, productId, action, quantity, variante = {}) =>
    api.patch(`/cart/${cartId}/item`, { 
      productId, 
      action, 
      quantity,
      talle: variante.talle || null,
      color: variante.color || null
    }),
  
  checkout: (cartId, data) => api.post(`/cart/${cartId}/checkout`, data),
  uploadReceipt: (cartId, receiptUrl) => api.put(`/cart/${cartId}/receipt`, { receiptUrl }),
  updateStatus: (cartId, status) => api.patch(`/cart/${cartId}/status`, { status }),
  rate: (cartId, productId, stars, comment) =>
    api.post(`/cart/${cartId}/rate/${productId}`, { stars, comment }),
};

export const mercadopagoAPI = {
  crearPreferencia: (cartId) => api.post("/mercadopago/crear-preferencia", { cartId }),
  getPago: (paymentId) => api.get(`/mercadopago/pago/${paymentId}`),
};