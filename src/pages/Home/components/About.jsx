import { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.container} ref={sectionRef}>
      {/* Background decorativo */}
      <div className={styles.bgDecor} />

      <div className={styles.wrapper}>
        {/* Contenido de texto - Lado izquierdo */}
        <div className={`${styles.content} ${isVisible ? styles.contentVisible : ""}`}>
          <div className={styles.textBlock}>
            <h1 className={styles.title}>
              Hecho para sentirte bien, verte mejor.
            </h1>

            <p className={styles.description}>
              Diseñado por Micaela Bazán, creamos bikinis a medida e indumentaria 
              deportiva que combinan estética, comodidad y libertad. Piezas que se 
              adaptan a vos, a tu cuerpo y a tu ritmo.
              <br />
              <br />
              Porque no se trata solo de cómo se ve… sino de cómo te hace sentir.
            </p>
          </div>

          {/* Línea decorativa */}
          <div className={styles.decorLine} />
        </div>

        {/* Imagen - Lado derecho */}
        <div className={`${styles.imageWrapper} ${isVisible ? styles.imageVisible : ""}`}>
          <div className={styles.imageContainer}>
            <img
              src="https://micaelabazan.com/wp-content/uploads/2023/10/Imagen-de-WhatsApp-2023-10-09-a-las-15.48.38_f9a13bd3.jpg"
              alt="Micaela Bazán - Founder"
              className={styles.image}
            />
            {/* Overlay decorativo en la imagen */}
            <div className={styles.imageOverlay} />
          </div>

          {/* Elemento decorativo flotante */}
          <div className={styles.floatingElement} />
        </div>
      </div>

      {/* Estadísticas o CTA opcional - Comentado por defecto */}
      {/* <div className={styles.statsSection}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>+500</span>
          <span className={styles.statLabel}>Clientes satisfechos</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>100%</span>
          <span className={styles.statLabel}>Hecho a medida</span>
        </div>
      </div> */}
    </section>
  );
};

export default About;