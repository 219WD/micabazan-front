import { useState } from "react";
import Hero from "./components/Hero";
import Strip from "./components/Strip";
import ProductosDestacados from "./components/ProductosDestacados";
import CtaBanner from "./components/CtaBanner";
import CategoriesHero from "./components/CategoriesHero";
import About from "./components/About";
import ModalCupon from "./components/ModalCupon.jsx";

const Home = () => {
  // Mostrar modal solo si no ha sido cerrado antes en esta sesión
  const [showModal, setShowModal] = useState(() => {
    return !sessionStorage.getItem("modalCuponClosed");
  });

  const handleModalClose = () => {
    setShowModal(false);
    sessionStorage.setItem("modalCuponClosed", "true");
  };

  const handleCuponSubmit = async (email) => {
    try {
      // Guardar cupón en localStorage para usarlo en carrito
      const cuponCode = "BIENVENIDA15";
      localStorage.setItem("cuponCode", cuponCode);
      localStorage.setItem("userEmail", email);

      // Aquí puedes agregar la llamada a tu API:
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, discountCode: 'BIENVENIDA15' })
      // });
      // if (!response.ok) throw new Error('Error al guardar email');

      console.log("Email registrado:", email);
      
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <div>
      {/* Modal Cupón de Bienvenida */}
      {showModal && (
        <ModalCupon 
          onClose={handleModalClose}
          discount={15}
          onSubmit={handleCuponSubmit}
          image="https://micaelabazan.com/wp-content/uploads/2025/08/dsc_8182-scaled.jpeg"
        />
      )}

      {/* Contenido de la página */}
      <Hero />
      <Strip />
      <ProductosDestacados />
      <CategoriesHero />
      <About />
      <CtaBanner />
    </div>
  );
};

export default Home;