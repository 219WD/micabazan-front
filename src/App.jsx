import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LoaderProvider } from "./context/LoaderContext";
import GlobalLoader from "./components/loaders/GlobalLoader";
import MiniLoader from "./components/loaders/MiniLoader";
import AppRouter from "./router/AppRouter";

const App = () => {
  return (
    <LoaderProvider>
      {/* Los loaders globales se renderizan aquí, fuera de otros contextos */}
      <GlobalLoader />
      <MiniLoader />

      {/* Resto de la app con sus providers */}
      <AuthProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </AuthProvider>
    </LoaderProvider>
  );
};

export default App;