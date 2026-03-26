import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoriesHero.module.css";

const CategoriesHero = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const categories = [
    {
      id: "BIKINIS Y ENTERIZAS",
      label: "Bikinis y\nEnterizas",
      image: "https://micaelabazan.com/wp-content/uploads/elementor/thumbs/img_6616-scaled-ri8a91azfe8oectv6g16i7d2cc2ihlm5sfr0lxh4w0.jpeg",
      filter: "BIKINIS Y ENTERIZAS",
      description: "Diseños exclusivos para el agua",
    },
    {
      id: "INDUMENTARIA DEPORTIVA",
      label: "Indumentaria\nDeportiva",
      image: "https://micaelabazan.com/wp-content/uploads/elementor/thumbs/7ce480d0-0c3b-4d5b-8f8b-ec3e8ffda51a-rgj9mvioyvah52pmmxpce1kzua1ps00zqng1r9qkuo.jpeg",
      filter: "INDUMENTARIA DEPORTIVA",
      description: "Rendimiento y estilo",
    },
    {
      id: "INDUMENTARIA CASUAL",
      label: "Indumentaria\nCasual",
      image: "https://micaelabazan.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2026-02-03-at-17.19.01-rimka2w8zw91xb7xpuouv0rbm528wycwbwhgj1v1ts.jpeg",
      filter: "INDUMENTARIA CASUAL",
      description: "Estilo para el día a día",
    },
    {
      id: "BEBES Y NIÑOS",
      label: "Bebés y\nNiños",
      image: "https://micaelabazan.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2026-01-28-at-11.30.38-ribp4r6rnxz8jz4prmee6w77kk4e8dh1btabkidtds.jpeg",
      filter: "BEBES Y NIÑOS",
      description: "Moda para los más pequeños",
    },
  ];

  const handleNavigate = (filterCategory) => {
    navigate("/productos", { state: { categoria: filterCategory } });
  };

  return (
    <div className={styles.container}>
      {/* Overlay gradiente decorativo */}
      <div className={styles.bgOverlay} />

      <div className={styles.gridContainer}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={styles.card}
            onMouseEnter={() => setHoveredCard(category.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleNavigate(category.filter)}
          >
            {/* Imagen de fondo */}
            <img
              src={category.image}
              alt={category.label}
              className={styles.image}
            />

            {/* Overlay oscuro */}
            <div
              className={`${styles.overlay} ${
                hoveredCard === category.id ? styles.overlayActive : ""
              }`}
            />

            {/* Contenido de texto */}
            <div className={styles.content}>
              <div className={styles.textWrapper}>
                <h2 className={styles.title}>{category.label}</h2>
                <p className={styles.description}>{category.description}</p>
              </div>

              {/* Botón */}
              <button
                className={`${styles.ctaButton} ${
                  hoveredCard === category.id ? styles.ctaActive : ""
                }`}
              >
                COMPRAR AHORA
              </button>
            </div>

            {/* Decorative accent line */}
            <div
              className={`${styles.accentLine} ${
                hoveredCard === category.id ? styles.accentActive : ""
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesHero;