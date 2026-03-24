import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import useHeroCarousel from "../../../hooks/useHeroCarousel";
import styles from "./Hero.module.css";

// ─── Slides — editá acá para agregar o cambiar ────────────────────────────────
const SLIDES = [
  {
    label:   "Nueva temporada",
    title:   ["Todo lo que", "necesitás,", "en un solo lugar."],
    titleEm: 1,
    cta:     "Ver productos",
    to:      "/productos",
    img:     "https://micaelabazan.com/wp-content/uploads/2025/10/img_9637-1-scaled.jpeg",
    imgAlt:  "Micaela Bazán — nueva temporada",
  },
  {
    label:   "Oferta especial",
    title:   ["Pagá con", "transferencia", "y llevate 20% off."],
    titleEm: 1,
    cta:     "Ver productos",
    to:      "/productos",
    img:     "https://micaelabazan.com/wp-content/uploads/elementor/thumbs/img_6070-scaled-ri313hio5ghbc42w5za5zkjkfnh1866bkantje29s0.jpeg",
    imgAlt:  "Transferencia 20% off",
  },
  {
    label:   "Nueva colección",
    title:   ["Chau verano,", "hola nueva", "temporada."],
    titleEm: 2,
    cta:     "Explorar colección",
    to:      "/productos",
    img:     "https://micaelabazan.com/wp-content/uploads/2026/03/img_5217-scaled.jpeg",
    imgAlt:  "Nueva temporada Micaela Bazán",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const { current, prev, next, goToIndex, refs } = useHeroCarousel(SLIDES.length);
  const { labelRef, linesRef, ctaRef, imgRef } = refs;

  const slide = SLIDES[current];

  return (
    // heroWrapper contiene las flechas posicionadas absolutas
    // hero es el grid del contenido — nunca se superpone
    <div className={styles.heroWrapper}>

      {/* Flechas — posicionadas sobre el wrapper, fuera del grid */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Anterior">
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Siguiente">
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Grid de contenido */}
      <section className={styles.hero}>
        <div className={styles.inner}>
          <p className={styles.label} ref={labelRef}>
            {slide.label}
          </p>

          <h1 className={styles.title}>
            {slide.title.map((line, i) => (
              <span
                key={i}
                className={styles.titleLine}
                ref={(el) => (linesRef.current[i] = el)}
              >
                {i === slide.titleEm ? <em>{line}</em> : line}
                {i < slide.title.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <button
            ref={ctaRef}
            className={`${styles.btn} btn btn-primary`}
            onClick={() => navigate(slide.to)}
          >
            {slide.cta}
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
          </button>
        </div>

        <div className={styles.deco}>
          <img
            ref={imgRef}
            src={slide.img}
            alt={slide.imgAlt}
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* Dots */}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => goToIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default Hero;