import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layout
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import WhatsAppButton from "../components/layout/WhatsAppButton.jsx";
import Marquesina from "./components/layout/Marquesina.jsx";

// Páginas públicas
import Home from "../pages/Home/Home.jsx";
import Productos from "../pages/Productos/Productos.jsx";
import Detalle from "../pages/Detalle/Detalle.jsx";
import Carrito from "../pages/Carrito/Carrito.jsx";
import Faqs from "../pages/Faqs/Faqs.jsx";
import SizeGuide from "../pages/Talles/Talles.jsx"

// Páginas de auth
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import ResetPasswordRequest from "../pages/Auth/ResetPasswordRequest.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";

// Páginas protegidas (requieren login)
import Checkout from "../pages/Checkout/Checkout.jsx";
import MisPedidos from "../pages/MisPedidos/MisPedidos.jsx";
import Perfil from "../pages/Perfil/Perfil.jsx";

// Páginas de pago
import PagoAprobado from "../pages/Pago/PagoAprobado.jsx";
import PagoRechazado from "../pages/Pago/PagoRechazado.jsx";
import PagoPendiente from "../pages/Pago/PagoPendiente.jsx";

// Panel admin
import Admin from "../pages/Admin/Admin.jsx";

// ─── Guards ───────────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isLogged, loading } = useAuth();
  if (loading) return null;
  return isLogged ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children, minRole = "moderador" }) => {
  const { isLogged, loading, isAtLeast } = useAuth();
  if (loading) return null;
  if (!isLogged) return <Navigate to="/login" replace />;
  if (!isAtLeast(minRole)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLogged, loading } = useAuth();
  if (loading) return null;
  return isLogged ? <Navigate to="/" replace /> : children;
};

// ─── Router ───────────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<Detalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/talles" element={<SizeGuide />} />


          {/* Auth — solo si no está logueado */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPasswordRequest />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* Privadas */}
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <PrivateRoute>
                <MisPedidos />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />

          {/* Pago */}
          <Route path="/pago/aprobado" element={<PagoAprobado />} />
          <Route path="/pago/rechazado" element={<PagoRechazado />} />
          <Route path="/pago/pendiente" element={<PagoPendiente />} />

          {/* Admin — moderador+ */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Marquesina />
      <Footer />

      {/* ← WhatsApp Button - Flotante en toda la página */}
      <WhatsAppButton
        phoneNumber="5491234567890"
        message="Hola! Quiero info para hacer un pedido a medida"
      />
    </BrowserRouter>
  );
};

export default AppRouter;
