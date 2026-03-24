import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { productosAPI } from "../../api/productosAPI";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../config";
import styles from "./Productos.module.css";

const ProductCard = ({ p, onAdd, agregando, agregado, onClick }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const hoverTimerRef = useRef(null);

  const imagenes = [p.image, ...(p.additionalImages || [])].filter(Boolean);
  const hasMultipleImages = imagenes.length > 1;

  const handleMouseEnter = () => {
    if (!hasMultipleImages) return;
    hoverTimerRef.current = setTimeout(() => setImgIndex(1), 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setImgIndex(0);
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageWrap}>
        {imagenes.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={p.title}
            className={`${styles.image} ${imgIndex === i ? styles.imageVisible : styles.imageHidden}`}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=."; }}
          />
        ))}
        {p.isFeatured && <span className={styles.offerBadge}>OFERTA</span>}
        {p.stock === 0 && <span className={styles.outOfStock}>Sin stock</span>}
        {p.stock > 0 && (
          <button
            className={styles.addBtn}
            onClick={(e) => onAdd(e, p)}
            disabled={agregando === p._id}
          >
            {agregado === p._id ? "✓" : <FontAwesomeIcon icon={faPlus} />}
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
        {p.category && <p className={styles.category}>{p.category}</p>}
        <p className={styles.name}>{p.title}</p>
        <div className={styles.priceBlock}>
          {p.precioAntes && p.precioAntes > p.price ? (
            <>
              <p className={styles.precioAntes}>{formatPrice(p.precioAntes, p.isUsd)}</p>
              <p className={`${styles.price} ${styles.priceOffer}`}>{formatPrice(p.price, p.isUsd)}</p>
            </>
          ) : (
            <p className={styles.price}>{formatPrice(p.price, p.isUsd)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [agregando, setAgregando] = useState(null);
  const [agregado, setAgregado] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.categoria) setCategoria(location.state.categoria);
  }, [location.state]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productosAPI.getAll({ active: true });
        setProductos(data);
        setFiltrados(data);
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))];
        setCategorias(cats);
      } catch {
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let r = productos;
    if (search) r = r.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (categoria) r = r.filter((p) => p.category === categoria);
    setFiltrados(r);
  }, [search, categoria, productos]);

  const handleAdd = async (e, producto) => {
    e.stopPropagation();
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

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="container"><p className="alert alert-error">{error}</p></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <p className="label">Catálogo</p>
          <h1 className={styles.title}>Productos</h1>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.cats}>
            <button
              className={`${styles.catBtn} ${categoria === "" ? styles.catActive : ""}`}
              onClick={() => setCategoria("")}
            >Todo</button>
            {categorias.map((c) => (
              <button
                key={c}
                className={`${styles.catBtn} ${categoria === c ? styles.catActive : ""}`}
                onClick={() => setCategoria(c)}
              >{c}</button>
            ))}
          </div>
          <p className={styles.count}>
            {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        {filtrados.length === 0 ? (
          <div className={styles.empty}><p>No se encontraron productos</p></div>
        ) : (
          <div className={styles.grid}>
            {filtrados.map((p) => (
              <ProductCard
                key={p._id}
                p={p}
                onAdd={handleAdd}
                agregando={agregando}
                agregado={agregado}
                onClick={() => navigate(`/productos/${p._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;