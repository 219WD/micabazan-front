import { useState } from "react";
import styles from "./SizeGuide.module.css";

const SizeGuide = () => {
  const [activeCategory, setActiveCategory] = useState("tops");

  const categories = {
    tops: {
      name: "CORPIÑOS Y BOMBACHAS / CONJUNTOS DEPORTIVOS",
      measurements: [
        { name: "Contorno de Busto", description: "Mide por la zona de más volumen", sizes: ["86/90", "91/95", "96/105"] },
        { name: "Contorno de Cintura", description: "Mide por la zona más angosta", sizes: ["69/71", "72/75", "76/80"] },
        { name: "Contorno de Cadera", description: "Mide por la zona más ancha", sizes: ["92/95", "96/99", "100/106"] }
      ]
    },
    bodysuits: {
      name: "ENTERIZAS Y MONITOS",
      measurements: [
        { name: "Contorno de Busto", description: "Mide por la zona de más volumen", sizes: ["86/90", "91/95", "96/105"] },
        { name: "Largo de Tiro", description: "Mide por el medio hasta la mitad del busto", sizes: ["43", "47", "50"] },
        { name: "Contorno de Cadera", description: "Mide por la zona más ancha", sizes: ["92/95", "96/99", "100/106"] }
      ]
    }
  };

  return (
    <div className={styles.sizeGuide}>
      <div className="container">
        <div className={styles.header}>
          <h2>Guía de Talles</h2>
          <p className={styles.intro}>
            Para elegir tu talle te recordamos que midas tu contorno de busto, 
            cintura, cadera y largo de tiro, comparando con el cuadrito de talles
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeCategory === "tops" ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory("tops")}
          >
            Corpiños y Bombachas
          </button>
          <button
            className={`${styles.tab} ${activeCategory === "bodysuits" ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory("bodysuits")}
          >
            Enterizas y Monitos
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medidas</th>
                <th>S</th>
                <th>M</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {categories[activeCategory].measurements.map((measurement, idx) => (
                <tr key={idx}>
                  <td className={styles.measureCell}>
                    <strong>{measurement.name}</strong>
                    <span className={styles.measureDescription}>{measurement.description}</span>
                  </td>
                  {measurement.sizes.map((size, sizeIdx) => (
                    <td key={sizeIdx} className={styles.sizeCell}>
                      {size}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.imageContainer}>
          <img 
            src="https://micaelabazan.com/wp-content/uploads/2020/10/talles2-1-1094x1536.jpg" 
            alt="Guía visual de cómo medir: contorno de busto, cintura, cadera y largo de tiro"
            className={styles.guideImage}
          />
          <p className={styles.imageCaption}>
            * Referencia visual para tomar las medidas correctamente
          </p>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Las medidas están expresadas en centímetros (cm)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;