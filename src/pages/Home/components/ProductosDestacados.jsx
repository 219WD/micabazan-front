import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { productosAPI } from "../../../api/productosAPI";
import { useCart } from "../../../context/CartContext";
import { formatPrice } from "../../../config";
import styles from "./ProductosDestacados.module.css";

const ProductCard = ({ producto, onAdd, agregando, agregado }) => {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const hoverTimerRef = useRef(null);

  const imagenes = [producto.image, ...(producto.additionalImages || [])].filter(Boolean);
  const hasMultipleImages = imagenes.length > 1;

  const handleMouseEnter = () => {
    if (!hasMultipleImages) return;
    hoverTimerRef.current = setTimeout(() => {
      setImgIndex(1);
    }, 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setImgIndex(0);
  };

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/productos/${producto._id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageWrap}>
        {imagenes.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={producto.title}
            className={`${styles.image} ${imgIndex === i ? styles.imageVisible : styles.imageHidden}`}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=."; }}
          />
        ))}
        {producto.isFeatured && (
          <span className={styles.offerBadge}>OFERTA</span>
        )}
        {producto.stock === 0 && (
          <span className={styles.outOfStock}>Sin stock</span>
        )}
        {producto.stock > 0 && (
          <button
            className={`${styles.addBtn} ${agregado ? styles.added : ""}`}
            onClick={(e) => { e.stopPropagation(); onAdd(producto); }}
            disabled={agregando}
          >
            {agregado ? "✓" : "+"}
          </button>
        )}
        {hasMultipleImages && (
          <div className={styles.imageDots}>
            {imagenes.map((_, i) => (
              <span key={i} className={`${styles.dot} ${imgIndex === i ? styles.dotActive : ""}`} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.info}>
        {producto.category && (
          <p className={styles.category}>{producto.category}</p>
        )}
        <p className={styles.name}>{producto.title}</p>
        <div className={styles.priceBlock}>
          {producto.precioAntes && producto.precioAntes > producto.price ? (
            <>
              <p className={styles.precioAntes}>{formatPrice(producto.precioAntes, producto.isUsd)}</p>
              <p className={`${styles.price} ${styles.priceOffer}`}>{formatPrice(producto.price, producto.isUsd)}</p>
            </>
          ) : (
            <p className={styles.price}>{formatPrice(producto.price, producto.isUsd)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductosDestacados = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(null);
  const [agregado, setAgregado] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productosAPI.getFeatured();
        const featured = data.filter((p) => p.isFeatured).slice(0, 8);
        setProductos(featured);
      } catch (err) {
        console.error("Error cargando productos destacados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAdd = async (producto) => {
    setAgregando(producto._id);
    try {
      await addToCart(producto, 1);
      setAgregado(producto._id);
      setTimeout(() => setAgregado(null), 1500);
    } catch (err) {
      alert(err.response?.data?.error || "Error al agregar al carrito");
    } finally {
      setAgregando(null);
    }
  };

  if (!loading && productos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className="label">Selección</p>
            <h2 className={styles.title}>Productos destacados</h2>
          </div>
          <button
            className={`btn btn-secondary ${styles.verTodosBtn}`}
            onClick={() => navigate("/productos")}
          >
            Ver todos
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
          </button>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {productos.map((p) => (
              <ProductCard
                key={p._id}
                producto={p}
                onAdd={handleAdd}
                agregando={agregando === p._id}
                agregado={agregado === p._id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductosDestacados;