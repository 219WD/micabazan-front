import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { carritoAPI } from "../api/carritoAPI";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

// ─── Carrito local (sin login) ────────────────────────────────────────────────
const LOCAL_KEY = "cart_local";

const getLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
};

// Función para generar ID único de variante (para localStorage)
const getVarianteKey = (productId, variante) => {
  return `${productId}|${variante.talle || 'null'}|${variante.color || 'null'}`;
};

export const CartProvider = ({ children }) => {
  const { user, isLogged } = useAuth();

  // items ahora incluye variante: { productId, title, image, price, quantity, talle, color }
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Cargar carrito al montar / cuando cambia el usuario ───────────────────
  useEffect(() => {
    if (isLogged && user?._id) {
      syncWithBackend();
    } else {
      // Sin login: cargar desde localStorage
      setItems(getLocalCart());
      setCartId(null);
    }
  }, [isLogged, user?._id]);

  // ── Sincronizar carrito local con el backend al loguearse ─────────────────
  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    try {
      const localItems = getLocalCart();

      // Si hay items locales, subirlos al backend primero
      if (localItems.length > 0) {
        for (const item of localItems) {
          try {
            await carritoAPI.add(
              item.productId, 
              item.quantity,
              { talle: item.talle, color: item.color }
            );
          } catch (err) {
            console.warn(`No se pudo sincronizar ${item.title}:`, err.message);
          }
        }
        localStorage.removeItem(LOCAL_KEY);
      }

      // Cargar carrito activo del backend
      const { data } = await carritoAPI.getActive(user._id);
      if (data) {
        setCartId(data._id);
        setItems(
          data.items
            .filter((i) => i.productId)
            .map((i) => ({
              productId: i.productId._id,
              title: i.productId.title,
              image: i.productId.image,
              price: i.priceAtPurchase,
              quantity: i.quantity,
              talle: i.talle || null,    // Agregar talle
              color: i.color || null,     // Agregar color
            }))
        );
      } else {
        setCartId(null);
        setItems([]);
      }
    } catch (err) {
      console.error("Error sincronizando carrito:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // ── Agregar al carrito (AHORA CON VARIANTE) ───────────────────────────────
  const addToCart = useCallback(async (product, quantity = 1, variante = {}) => {
    if (isLogged) {
      // Con login: llamar al backend
      setLoading(true);
      try {
        const { data } = await carritoAPI.add(product._id, quantity, variante);
        setCartId(data._id);
        setItems(
          data.items
            .filter((i) => i.productId)
            .map((i) => ({
              productId: i.productId._id,
              title: i.productId.title,
              image: i.productId.image,
              price: i.priceAtPurchase,
              quantity: i.quantity,
              talle: i.talle || null,
              color: i.color || null,
            }))
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Sin login: guardar en localStorage con variante
      const local = getLocalCart();
      const varianteKey = getVarianteKey(product._id, variante);
      const idx = local.findIndex(i => getVarianteKey(i.productId, { talle: i.talle, color: i.color }) === varianteKey);
      
      if (idx !== -1) {
        local[idx].quantity += quantity;
      } else {
        local.push({
          productId: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity,
          talle: variante.talle || null,
          color: variante.color || null,
        });
      }
      saveLocalCart(local);
      setItems([...local]);
    }
  }, [isLogged]);

  // ── Cambiar cantidad (AHORA CON VARIANTE) ──────────────────────────────────
  const updateItem = useCallback(async (productId, action, quantity, variante = {}) => {
    if (isLogged && cartId) {
      setLoading(true);
      try {
        const { data } = await carritoAPI.updateItem(cartId, productId, action, quantity, variante);
        setItems(
          data.cart.items
            .filter((i) => i.productId)
            .map((i) => ({
              productId: i.productId._id,
              title: i.productId.title,
              image: i.productId.image,
              price: i.priceAtPurchase,
              quantity: i.quantity,
              talle: i.talle || null,
              color: i.color || null,
            }))
        );
      } finally {
        setLoading(false);
      }
    } else {
      const local = getLocalCart();
      const varianteKey = getVarianteKey(productId, variante);
      const idx = local.findIndex(i => getVarianteKey(i.productId, { talle: i.talle, color: i.color }) === varianteKey);
      
      if (idx === -1) return;

      if (action === "add") local[idx].quantity += 1;
      else if (action === "subtract") {
        local[idx].quantity -= 1;
        if (local[idx].quantity <= 0) local.splice(idx, 1);
      } else if (action === "remove") {
        local.splice(idx, 1);
      } else if (action === "set" && quantity >= 1) {
        local[idx].quantity = quantity;
      }

      saveLocalCart(local);
      setItems([...local]);
    }
  }, [isLogged, cartId]);

  // ── Vaciar carrito (post checkout) ────────────────────────────────────────
  const clearCart = useCallback(() => {
    localStorage.removeItem(LOCAL_KEY);
    setItems([]);
    setCartId(null);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      cartId,
      loading,
      totalItems,
      totalAmount,
      addToCart,
      updateItem,
      clearCart,
      syncWithBackend,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
};