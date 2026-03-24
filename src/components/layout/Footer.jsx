import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { CONFIG } from "../../config";
import styles from "./Footer.module.css";
import logoBn from "../../assets/mb-logo-bl.png"

const Footer = () => (
  <>
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Marca */}
        <div className={styles.brand}>
          <img src={logoBn} alt={CONFIG.SHOP_NAME} className={styles.logo} />
          <p className={styles.tagline}>
            Bikinis de diseño · Hacemos a medida<br />
            Indumentaria deportiva
          </p>
          <div className={styles.contact}>
            <span className={styles.contactItem}>
              <FontAwesomeIcon icon={faLocationDot} className={styles.contactIcon} />
              España 984 – Rosario, Santa Fe
            </span>
            <a href="tel:+5493416609853" className={styles.contactItem}>
              <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
              +54 9 3416 60-9853
            </a>
            <a href="mailto:info@micaelabazan.com" className={styles.contactItem}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
              info@micaelabazan.com
            </a>
          </div>
        </div>

        {/* Productos */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Productos</p>
          <nav className={styles.colLinks}>
            <Link to="/productos?categoria=trajes-de-bano" className={styles.link}>Trajes de baño</Link>
            <Link to="/productos?categoria=ropa-de-playa" className={styles.link}>Ropa de playa</Link>
            <Link to="/productos?categoria=indumentaria-deportiva" className={styles.link}>Indumentaria deportiva</Link>
            <Link to="/productos?categoria=indumentaria-casual" className={styles.link}>Indumentaria casual</Link>
            <Link to="/productos?categoria=bebes-y-ninos" className={styles.link}>Bebés y niños</Link>
          </nav>
        </div>

        {/* Pagos y envíos */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Pagos y envíos</p>
          <nav className={styles.colLinks}>
            <Link to="/formas-de-pago" className={styles.link}>Formas de pago</Link>
            <Link to="/envios" className={styles.link}>Envíos</Link>
          </nav>
          <p className={styles.colTitle} style={{ marginTop: "var(--s5)" }}>Ayuda</p>
          <nav className={styles.colLinks}>
            <Link to="/talle" className={styles.link}>¿Qué talle soy?</Link>
            <Link to="/faq" className={styles.link}>Preguntas frecuentes</Link>
            <Link to="/privacidad" className={styles.link}>Políticas de privacidad</Link>
            <Link to="/cambios-y-devoluciones" className={styles.link}>Cambios y devoluciones</Link>
          </nav>
        </div>

        {/* Redes */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Seguinos</p>
          <div className={styles.social}>
            <a
              href="https://www.instagram.com/micaelabazandesigns/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faInstagram} />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/micaelabazandesigns"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faFacebook} />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        <span className={styles.copy}>
          © {new Date().getFullYear()} Prendas diseñadas por Micaela Bazán. Todos los derechos reservados.
        </span>
      </div>
    </footer>

    {/* Créditos 219Labs */}
    <div className={styles.credits}>
      Hecho con ♥ por <a href="https://219labs.com.ar" target="_blank" rel="noopener noreferrer">219Labs</a> · Tiendas online en 219Shops
    </div>
  </>
);

export default Footer;