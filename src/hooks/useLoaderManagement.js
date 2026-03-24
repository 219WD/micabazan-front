import { useCallback } from 'react';
import { useLoader } from '../context/LoaderContext';

/**
 * Hook para controlar el mini loader de manera segura
 * 
 * Uso:
 * const { showLoader, hideLoader } = useLoaderManagement();
 * 
 * showLoader(1000); // Mostrar loader por 1 segundo
 * 
 * En una petición:
 * const response = await fetchData()
 *   .finally(() => hideLoader());
 * 
 * O con async/await:
 * const handleFetch = async () => {
 *   showLoader(2000);
 *   try {
 *     const data = await fetch(...);
 *     return await data.json();
 *   } finally {
 *     hideLoader();
 *   }
 * };
 */
export const useLoaderManagement = () => {
  const { showMiniLoaderFor, hideMiniLoader } = useLoader();

  const showLoader = useCallback(
    (duration = 800) => {
      showMiniLoaderFor(duration);
    },
    [showMiniLoaderFor]
  );

  const hideLoader = useCallback(() => {
    hideMiniLoader();
  }, [hideMiniLoader]);

  return {
    showLoader,
    hideLoader,
  };
};

export default useLoaderManagement;