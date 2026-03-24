import { useState } from "react";
import styles from "./Marquesina.module.css";

// Componente de icono shining personalizado y optimizado
const ShiningIcon = () => (
  <svg 
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ 
      display: 'inline-block',
      verticalAlign: 'middle'
    }}
  >
    {/* Estrella principal de 8 puntas */}
    <path 
      d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" 
      fill="currentColor"
      fillOpacity="0.9"
    />
    {/* Destello interior */}
    <path 
      d="M12 5L13.5 9.5L18 11L13.5 12.5L12 17L10.5 12.5L6 11L10.5 9.5L12 5Z" 
      fill="white"
      fillOpacity="0.7"
    />
    {/* Centro brillante */}
    <circle 
      cx="12" 
      cy="11" 
      r="1.5" 
      fill="white"
    >
      <animate 
        attributeName="r" 
        values="1.5;2;1.5" 
        dur="1.2s" 
        repeatCount="indefinite" 
      />
      <animate 
        attributeName="fillOpacity" 
        values="1;0.6;1" 
        dur="1.2s" 
        repeatCount="indefinite" 
      />
    </circle>
  </svg>
);

const Marquesina = ({
  text = "Hecho para sentirte bien, verte mejor.",
  speed = 12,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const repeticiones = Array(6)
    .fill(null)
    .map((_, i) => (
      <span key={i} className={styles.item}>
        <span className={styles.text}>{text}</span>
        <span className={styles.icon}>
          <ShiningIcon />
        </span>
      </span>
    ));

  return (
    <section className={styles.container}>
      <div
        className={styles.marquesina}
        style={{
          "--animation-duration": `${speed}s`,
          "--is-paused": isPaused ? "paused" : "running",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {repeticiones}
        {repeticiones}
      </div>
    </section>
  );
};

export default Marquesina;