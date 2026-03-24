import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * LoaderContext - Maneja el estado global de loaders
 * - GlobalLoader: Pantalla inicial que cubre toda la app
 * - MiniLoader: Loader flotante para peticiones/cambios dinámicos
 */
const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  // ── GLOBAL LOADER (Pantalla completa inicial) ──────────────────────────
  const [showGlobalLoader, setShowGlobalLoader] = useState(() => {
    // Solo mostrar la primera vez que entra el usuario
    const hasSeenGlobalLoader = sessionStorage.getItem('globalLoaderShown');
    return !hasSeenGlobalLoader;
  });

  const [globalLoaderComplete, setGlobalLoaderComplete] = useState(false);

  // ── MINI LOADER (Para peticiones) ──────────────────────────────────────
  const [showMiniLoader, setShowMiniLoader] = useState(false);
  const miniLoaderTimeoutRef = useRef(null);

  // ── APP READY (Indica que la app está lista para usarse) ────────────────
  const [appReady, setAppReady] = useState(false);

  // ── Marcar Global Loader como visto cuando se complete ─────────────────
  useEffect(() => {
    if (globalLoaderComplete && showGlobalLoader) {
      sessionStorage.setItem('globalLoaderShown', 'true');
      
      // Dar tiempo para que se vea la animación final antes de desaparecer
      const timer = setTimeout(() => {
        setShowGlobalLoader(false);
        // Una vez que desaparece el global loader, la app está lista
        setAppReady(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [globalLoaderComplete, showGlobalLoader]);

  // ── Métodos para completar animaciones ────────────────────────────────
  const completeGlobalLoader = useCallback(() => {
    setGlobalLoaderComplete(true);
  }, []);

  // ── Controlar Mini Loader ────────────────────────────────────────────
  const showMiniLoaderFor = useCallback((duration = 800) => {
    setShowMiniLoader(true);

    // Limpiar timeout anterior si existe
    if (miniLoaderTimeoutRef.current) {
      clearTimeout(miniLoaderTimeoutRef.current);
    }

    // Ocultar después de la duración especificada
    miniLoaderTimeoutRef.current = setTimeout(() => {
      setShowMiniLoader(false);
    }, duration);
  }, []);

  const hideMiniLoader = useCallback(() => {
    setShowMiniLoader(false);
    if (miniLoaderTimeoutRef.current) {
      clearTimeout(miniLoaderTimeoutRef.current);
    }
  }, []);

  // ── Limpiar timeouts al desmontar ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (miniLoaderTimeoutRef.current) {
        clearTimeout(miniLoaderTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    // Global Loader
    showGlobalLoader,
    globalLoaderComplete,
    completeGlobalLoader,

    // Mini Loader
    showMiniLoader,
    showMiniLoaderFor,
    hideMiniLoader,

    // App
    appReady,
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  );
};

/**
 * Hook para usar el LoaderContext
 * @returns {Object} Objeto con el contexto del loader
 * @throws {Error} Si no está dentro de LoaderProvider
 */
export const useLoader = () => {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error(
      '❌ useLoader debe ser usado dentro de <LoaderProvider>. ' +
      'Asegúrate de que LoaderProvider envuelve tu App en main.jsx'
    );
  }

  return context;
};