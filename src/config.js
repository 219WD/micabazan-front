// ─── Configuración central del proyecto ──────────────────────────────────────
// Para duplicar para otro cliente: solo cambiás este archivo

export const CONFIG = {
  SHOP_NAME: "Micaela Bazan",
  SHOP_TAGLINE: "Tienda Online",
  API_URL: import.meta.env.VITE_API_URL || "https://micabazan-back.vercel.app",
  CURRENCY: "ARS",
  CURRENCY_SYMBOL: "$",
  WHATSAPP: import.meta.env.VITE_WHATSAPP || "", // opcional
};

// Formateador de precio reutilizable
export const formatPrice = (price, isUsd = false) => {
  if (isUsd) {
    return `USD ${Number(price).toLocaleString("es-AR")}`;
  }
  return `${CONFIG.CURRENCY_SYMBOL} ${Number(price).toLocaleString("es-AR")}`;
};