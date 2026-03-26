import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMinus,
  faPlus,
  faShoppingBag,
  faTimes,
  faSearchPlus,
  faRandom,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { productosAPI } from "../../api/productosAPI";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../config";
import styles from "./Detalle.module.css";

/* ─── Lightbox ──────────────────────────────────── */
const Lightbox = ({ imagenes, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + imagenes.length) % imagenes.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % imagenes.length);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + imagenes.length) % imagenes.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % imagenes.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [imagenes.length, onClose]);

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div
        className={styles.lightboxContent}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imagenes[index]}
          alt={`Imagen ${index + 1}`}
          className={styles.lightboxImg}
        />
        {imagenes.length > 1 && (
          <>
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={prev}
            >
              &#8592;
            </button>
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={next}
            >
              &#8594;
            </button>
            <div className={styles.lightboxDots}>
              {imagenes.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.lightboxDot} ${i === index ? styles.lightboxDotActive : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── ProductCard Sugerido ───────────────────────────────────── */
const SuggestedProductCard = ({ p, onAdd, agregando, agregado, onClick }) => {
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
      className={styles.suggestedCard}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.suggestedImageWrap}>
        {imagenes.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={p.title}
            className={`${styles.suggestedImage} ${imgIndex === i ? styles.suggestedImageVisible : styles.suggestedImageHidden}`}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=."; }}
          />
        ))}
        {p.stock > 0 && (
          <button
            className={styles.suggestedAddBtn}
            onClick={(e) => onAdd(e, p)}
            disabled={agregando === p._id}
          >
            {agregado === p._id ? "✓" : <FontAwesomeIcon icon={faPlus} />}
          </button>
        )}
        {hasMultipleImages && (
          <div className={styles.suggestedImageDots}>
            {imagenes.map((_, i) => (
              <span key={i} className={`${styles.suggestedDot} ${imgIndex === i ? styles.suggestedDotActive : ""}`} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.suggestedInfo}>
        <p className={styles.suggestedName}>{p.title}</p>
        <div className={styles.suggestedPriceBlock}>
          {p.precioAntes && p.precioAntes > p.price ? (
            <>
              <p className={styles.suggestedPrecioAntes}>{formatPrice(p.precioAntes, p.isUsd)}</p>
              <p className={styles.suggestedPrice}>{formatPrice(p.price, p.isUsd)}</p>
            </>
          ) : (
            <p className={styles.suggestedPrice}>{formatPrice(p.price, p.isUsd)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Detalle ───────────────────────────────────── */
const Detalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const [imgActiva, setImgActiva] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Estados para productos sugeridos
  const [sugeridos, setSugeridos] = useState([]);
  const [tipoSugeridos, setTipoSugeridos] = useState("categoria"); // "categoria" o "aleatorio"
  const [agregandoSugerido, setAgregandoSugerido] = useState(null);
  const [agregadoSugerido, setAgregadoSugerido] = useState(null);

  const [colorSelected, setColorSelected] = useState(null);
  const [talleSelected, setTalleSelected] = useState(null);
  const [errorVariante, setErrorVariante] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await productosAPI.getById(id);
        setProducto(data);

        if (data.variantes?.length > 0) {
          const coloresUnicos = [
            ...new Set(
              data.variantes.filter((v) => v.color).map((v) => v.color),
            ),
          ];
          const tallesUnicos = [
            ...new Set(
              data.variantes.filter((v) => v.talle).map((v) => v.talle),
            ),
          ];
          if (coloresUnicos.length === 1) setColorSelected(coloresUnicos[0]);
          if (tallesUnicos.length === 1) setTalleSelected(tallesUnicos[0]);
        }
      } catch {
        setError("Producto no encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Cargar productos sugeridos cuando se carga el producto
  useEffect(() => {
    if (producto) {
      cargarSugeridos("categoria");
    }
  }, [producto]);

  const cargarSugeridos = async (tipo) => {
    if (!producto) return;
    
    try {
      const { data: todosProductos } = await productosAPI.getAll({ active: true });
      
      // Filtrar el producto actual
      let sugeridosFiltrados = todosProductos.filter(p => p._id !== producto._id);
      
      if (tipo === "categoria" && producto.category) {
        // Mostrar productos de la misma categoría primero
        const mismaCategoria = sugeridosFiltrados.filter(p => p.category === producto.category);
        const otrasCategorias = sugeridosFiltrados.filter(p => p.category !== producto.category);
        sugeridosFiltrados = [...mismaCategoria, ...otrasCategorias];
      } else if (tipo === "aleatorio") {
        // Mezclar aleatoriamente
        for (let i = sugeridosFiltrados.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sugeridosFiltrados[i], sugeridosFiltrados[j]] = [sugeridosFiltrados[j], sugeridosFiltrados[i]];
        }
      }
      
      // Tomar máximo 8 productos sugeridos
      const sugeridosLimitados = sugeridosFiltrados.slice(0, 8);
      setSugeridos(sugeridosLimitados);
      setTipoSugeridos(tipo);
    } catch (error) {
      console.error("Error cargando productos sugeridos:", error);
    }
  };

  const handleRandomSugeridos = () => {
    cargarSugeridos("aleatorio");
  };

  const handleSuggestedAdd = async (e, producto) => {
    e.stopPropagation();
    setAgregandoSugerido(producto._id);
    try {
      await addToCart(producto, 1);
      setAgregadoSugerido(producto._id);
      setTimeout(() => setAgregadoSugerido(null), 1500);
    } catch (err) {
      alert(err.response?.data?.error || "Error al agregar al carrito");
    } finally {
      setAgregandoSugerido(null);
    }
  };

  // ── Derivados ─────────────────────────────────────────────────────────────
  const usaVariantes = producto?.variantes?.length > 0;
  const todosLosColores = usaVariantes
    ? [
        ...new Set(
          producto.variantes.filter((v) => v.color).map((v) => v.color),
        ),
      ]
    : [];
  const todosLosTalles = usaVariantes
    ? [
        ...new Set(
          producto.variantes.filter((v) => v.talle).map((v) => v.talle),
        ),
      ]
    : [];

  // Talles con stock en el color seleccionado
  const tallesConStock = usaVariantes
    ? producto.variantes
        .filter(
          (v) => (!colorSelected || v.color === colorSelected) && v.stock > 0,
        )
        .map((v) => v.talle)
        .filter(Boolean)
    : [];

  // Colores con stock en el talle seleccionado
  const coloresConStock = usaVariantes
    ? producto.variantes
        .filter(
          (v) => (!talleSelected || v.talle === talleSelected) && v.stock > 0,
        )
        .map((v) => v.color)
        .filter(Boolean)
    : [];

  // Stock de la variante activa. Si aún no eligió todo, muestra stock total.
  const stockActual = (() => {
    if (!usaVariantes) return producto?.stock ?? 0;
    const necesitaColor = todosLosColores.length > 0;
    const necesitaTalle = todosLosTalles.length > 0;
    if ((necesitaColor && !colorSelected) || (necesitaTalle && !talleSelected))
      return producto.stock;
    const v = producto.variantes.find(
      (v) =>
        (!necesitaColor || v.color === colorSelected) &&
        (!necesitaTalle || v.talle === talleSelected),
    );
    return v?.stock ?? 0;
  })();

  const handleColorSelect = (color) => {
    setColorSelected(color);
    setErrorVariante("");
    // Si el talle elegido no tiene stock en este color, resetearlo
    if (talleSelected) {
      const tallesOk = producto.variantes
        .filter((v) => v.color === color && v.stock > 0)
        .map((v) => v.talle);
      if (!tallesOk.includes(talleSelected)) setTalleSelected(null);
    }
    setCantidad(1);
  };

  const handleTalleSelect = (talle) => {
    setTalleSelected(talle);
    setErrorVariante("");
    // Si el color elegido no tiene stock en este talle, resetearlo
    if (colorSelected) {
      const coloresOk = producto.variantes
        .filter((v) => v.talle === talle && v.stock > 0)
        .map((v) => v.color);
      if (!coloresOk.includes(colorSelected)) setColorSelected(null);
    }
    setCantidad(1);
  };

  const handleAdd = async () => {
    if (usaVariantes) {
      if (todosLosColores.length > 0 && !colorSelected) {
        setErrorVariante("Seleccioná un color");
        return;
      }
      if (todosLosTalles.length > 0 && !talleSelected) {
        setErrorVariante("Seleccioná un talle");
        return;
      }
    }
    setErrorVariante("");
    setAgregando(true);
    try {
      await addToCart(producto, cantidad, {
        talle: talleSelected,
        color: colorSelected,
      });
      setAgregado(true);
      setTimeout(() => setAgregado(false), 2000);
    } catch (err) {
      alert(err.response?.data?.error || "Error al agregar al carrito");
    } finally {
      setAgregando(false);
    }
  };

  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  if (error)
    return (
      <div className="page">
        <div className="container">
          <p className="alert alert-error">{error}</p>
          <button
            onClick={() => navigate("/productos")}
            className={`${styles.back} btn btn-ghost`}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>
      </div>
    );

  const imagenes = [
    producto.image,
    ...(producto.additionalImages || []),
  ].filter(Boolean);
  const tieneDescuento =
    producto.precioAntes && producto.precioAntes > producto.price;
  const maxCantidad = Math.min(stockActual, 99);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>

        <div className={styles.layout}>
          {/* ── Galería ── */}
          <div className={styles.gallery}>
            <div
              className={styles.mainImg}
              onClick={() => setLightboxOpen(true)}
              title="Click para ampliar"
            >
              <img
                src={imagenes[imgActiva]}
                alt={producto.title}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x750?text=.";
                }}
              />
              <span className={styles.zoomHint}>
                <FontAwesomeIcon icon={faSearchPlus} />
              </span>
              {imagenes.length > 1 && (
                <>
                  <button
                    className={`${styles.galleryNav} ${styles.galleryPrev}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgActiva(
                        (i) => (i - 1 + imagenes.length) % imagenes.length,
                      );
                    }}
                  >
                    &#8592;
                  </button>
                  <button
                    className={`${styles.galleryNav} ${styles.galleryNext}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgActiva((i) => (i + 1) % imagenes.length);
                    }}
                  >
                    &#8594;
                  </button>
                  <div className={styles.galleryDots}>
                    {imagenes.map((_, i) => (
                      <span
                        key={i}
                        className={`${styles.galleryDot} ${imgActiva === i ? styles.galleryDotActive : ""}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className={styles.thumbs}>
                {imagenes.map((img, i) => (
                  <div
                    key={i}
                    className={`${styles.thumb} ${imgActiva === i ? styles.thumbActive : ""}`}
                    onClick={() => setImgActiva(i)}
                  >
                    <img
                      src={img}
                      alt={`${producto.title} ${i + 1}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className={styles.info}>
            {producto.category && (
              <p className={styles.category}>{producto.category}</p>
            )}
            <h1 className={styles.title}>{producto.title}</h1>

            {/* Precio */}
            <div className={styles.priceBlock}>
              {tieneDescuento ? (
                <>
                  <p className={styles.precioAntes}>
                    {formatPrice(producto.precioAntes, producto.isUsd)}
                  </p>
                  <p className={`${styles.price} ${styles.priceOffer}`}>
                    {formatPrice(producto.price, producto.isUsd)}
                  </p>
                  <span className={styles.descuentoBadge}>
                    -
                    {Math.round(
                      ((producto.precioAntes - producto.price) /
                        producto.precioAntes) *
                        100,
                    )}
                    %
                  </span>
                </>
              ) : (
                <p className={styles.price}>
                  {formatPrice(producto.price, producto.isUsd)}
                </p>
              )}
            </div>

            {producto.numReviews > 0 && (
              <div className={styles.rating}>
                <span className={styles.stars}>
                  {"★".repeat(Math.round(producto.rating))}
                  {"☆".repeat(5 - Math.round(producto.rating))}
                </span>
                <span className={styles.ratingCount}>
                  {producto.rating.toFixed(1)} ({producto.numReviews})
                </span>
              </div>
            )}

            {producto.description && (
              <p className={styles.description}>{producto.description}</p>
            )}

            <div className={styles.divider} />

            {/* ── Variantes ── */}
            {usaVariantes && (
              <div className={styles.variantesWrap}>
                {errorVariante && (
                  <p className={styles.varianteError}>{errorVariante}</p>
                )}

                {/* Color */}
                {todosLosColores.length > 0 && (
                  <div className={styles.varianteSection}>
                    <div className={styles.varianteHeader}>
                      <span className={styles.attrLabel}>Color</span>
                      {colorSelected && (
                        <span className={styles.attrValue}>
                          {colorSelected}
                        </span>
                      )}
                    </div>
                    <div className={styles.coloresGrid}>
                      {todosLosColores.map((c) => {
                        const disponible =
                          !talleSelected || coloresConStock.includes(c);
                        return (
                          <button
                            key={c}
                            className={`${styles.colorBtn} ${colorSelected === c ? styles.colorBtnActive : ""} ${!disponible ? styles.btnAgotado : ""}`}
                            onClick={() => disponible && handleColorSelect(c)}
                            title={!disponible ? "Sin stock en este talle" : ""}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Talle */}
                {todosLosTalles.length > 0 && (
                  <div className={styles.varianteSection}>
                    <div className={styles.varianteHeader}>
                      <span className={styles.attrLabel}>Talle</span>
                      {talleSelected && (
                        <span className={styles.attrValue}>
                          {talleSelected}
                        </span>
                      )}
                    </div>
                    <div className={styles.tallesGrid}>
                      {todosLosTalles.map((t) => {
                        const disponible =
                          !colorSelected || tallesConStock.includes(t);
                        return (
                          <button
                            key={t}
                            className={`${styles.talleBtn} ${talleSelected === t ? styles.talleBtnActive : ""} ${!disponible ? styles.btnAgotado : ""}`}
                            onClick={() => disponible && handleTalleSelect(t)}
                            title={!disponible ? "Sin stock en este color" : ""}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock */}
            <p className={styles.stock}>
              {stockActual > 0 ? (
                <span className={styles.inStock}>
                  En stock — {stockActual}{" "}
                  {stockActual === 1 ? "disponible" : "disponibles"}
                </span>
              ) : (
                <span className={styles.outStock}>Sin stock</span>
              )}
            </p>

            {/* Cantidad */}
            {stockActual > 0 && (
              <div className={styles.cantidadWrap}>
                <span className={styles.cantidadLabel}>Cantidad</span>
                <div className={styles.cantidad}>
                  <button
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                    className={styles.cantBtn}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className={styles.cantNum}>{cantidad}</span>
                  <button
                    onClick={() =>
                      setCantidad((c) => Math.min(maxCantidad, c + 1))
                    }
                    disabled={cantidad >= maxCantidad}
                    className={styles.cantBtn}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className={styles.actions}>
              <button
                className={`btn ${agregado ? "btn-accent" : "btn-primary"} ${styles.addBtn}`}
                onClick={handleAdd}
                disabled={agregando || stockActual === 0}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                {agregando
                  ? "Agregando..."
                  : agregado
                    ? "¡Agregado!"
                    : "Agregar al carrito"}
              </button>
              <button
                className={`btn btn-secondary ${styles.cartBtn}`}
                onClick={() => navigate("/carrito")}
              >
                Ver carrito
              </button>
            </div>
          </div>
        </div>

        {/* ── Sección de productos sugeridos ── */}
        {sugeridos.length > 0 && (
          <div className={styles.suggestedSection}>
            <div className={styles.suggestedHeader}>
              <div className={styles.suggestedTitleWrap}>
                <h2 className={styles.suggestedTitle}>
                  {tipoSugeridos === "categoria" ? "Productos relacionados" : "Te puede interesar"}
                </h2>
                <span className={styles.suggestedBadge}>
                  {tipoSugeridos === "categoria" ? (
                    <><FontAwesomeIcon icon={faTag} /> Misma categoría</>
                  ) : (
                    <><FontAwesomeIcon icon={faRandom} /> Selección aleatoria</>
                  )}
                </span>
              </div>
              <button
                className={styles.randomBtn}
                onClick={handleRandomSugeridos}
                title="Ver sugerencias aleatorias"
              >
                <FontAwesomeIcon icon={faRandom} />
                <span>Aleatorio</span>
              </button>
            </div>
            
            <div className={styles.suggestedGrid}>
              {sugeridos.map((p) => (
                <SuggestedProductCard
                  key={p._id}
                  p={p}
                  onAdd={handleSuggestedAdd}
                  agregando={agregandoSugerido}
                  agregado={agregadoSugerido}
                  onClick={() => navigate(`/productos/${p._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          imagenes={imagenes}
          initialIndex={imgActiva}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default Detalle;