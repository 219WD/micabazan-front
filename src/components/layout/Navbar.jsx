import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faUser, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { CONFIG } from "../../config";
import styles from "./Navbar.module.css";
import logoNg from "../../assets/mb-logo.webp";

const Navbar = () => {
  const { user, isLogged, logout, isAtLeast } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* Left */}
        <div className={styles.side}>
          <Link to="/productos" className={styles.navLink}>Productos</Link>
          <Link to="/talles" className={styles.navLink}>Cuál es mi talle?</Link>
          <Link to="/faqs" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Cómo comprar?</Link>
          {isLogged && isAtLeast("moderador") && (
            <Link to="/admin" className={styles.navLink}>Admin</Link>
          )}
        </div>

        {/* Center — logo */}
        <Link to="/" className={styles.logo}>
          <img src={logoNg} alt={CONFIG.SHOP_NAME} className={styles.logoImg} />
        </Link>

        {/* Right */}
        <div className={styles.side} style={{ justifyContent: "flex-end" }}>
          {/* Carrito */}
          <Link to="/carrito" className={styles.iconBtn}>
            <FontAwesomeIcon icon={faShoppingBag} />
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </Link>

          {/* Usuario */}
          {isLogged ? (
            <div className={styles.userWrap} ref={dropRef}>
              <button className={styles.iconBtn} onClick={() => setUserOpen((o) => !o)}>
                <FontAwesomeIcon icon={faUser} />
              </button>
              {userOpen && (
                <div className={styles.dropdown}>
                  <span className={styles.dropName}>{user.name}</span>
                  <Link to="/perfil" className={styles.dropLink} onClick={() => setUserOpen(false)}>Mi perfil</Link>
                  <Link to="/mis-pedidos" className={styles.dropLink} onClick={() => setUserOpen(false)}>Mis pedidos</Link>
                  <button className={styles.dropLogout} onClick={handleLogout}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.navLink}>Ingresar</Link>
              <Link to="/register" className={`${styles.navLink} ${styles.navLinkAccent}`}>Registrarse</Link>
            </div>
          )}

          {/* Mobile burger */}
          <button className={styles.burger} onClick={() => setMobileOpen((o) => !o)}>
            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/productos" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Productos</Link>
          <Link to="/talles" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Cuál es mi talle?</Link>
          <Link to="/faqs" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Cómo comprar?</Link>
          {isLogged && isAtLeast("moderador") && (
            <Link to="/admin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          <div className={styles.mobileDivider} />
          {isLogged ? (
            <>
              <Link to="/perfil" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Mi perfil</Link>
              <Link to="/mis-pedidos" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Mis pedidos</Link>
              <button className={styles.mobileLogout} onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Ingresar</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Registrarse</Link>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;