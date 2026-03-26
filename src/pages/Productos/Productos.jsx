import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faSearch, 
  faChevronLeft, 
  faChevronRight,
  faFilter,
  faTimes,
  faArrowUpWideShort,
  faArrowDownWideShort,
  faCalendar,
  faTag
} from "@fortawesome/free-solid-svg-icons";
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
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 16;

  // Nuevos estados para filtros avanzados
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(false);
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);
  const [tallesSeleccionados, setTallesSeleccionados] = useState([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [ordenamiento, setOrdenamiento] = useState("default"); // default, price-asc, price-desc, newest, oldest
  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  const [tallesDisponibles, setTallesDisponibles] = useState([]);

  useEffect(() => {
    if (location.state?.categoria) setCategoria(location.state.categoria);
  }, [location.state]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productosAPI.getAll({ active: true });
        setProductos(data);
        setFiltrados(data);
        
        // Extraer categorías únicas
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))];
        setCategorias(cats);
        
        // Extraer colores únicos de las variantes
        const colores = new Set();
        const talles = new Set();
        
        data.forEach(producto => {
          if (producto.variantes && producto.variantes.length > 0) {
            producto.variantes.forEach(variante => {
              if (variante.color) colores.add(variante.color);
              if (variante.talle) talles.add(variante.talle);
            });
          }
        });
        
        setColoresDisponibles(Array.from(colores).sort());
        setTallesDisponibles(Array.from(talles).sort());
      } catch {
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Función para filtrar y ordenar productos
  const aplicarFiltrosYOrden = () => {
    let r = [...productos];
    
    // Filtro por búsqueda
    if (search) {
      r = r.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    }
    
    // Filtro por categoría
    if (categoria) {
      r = r.filter((p) => p.category === categoria);
    }
    
    // Filtro por colores
    if (coloresSeleccionados.length > 0) {
      r = r.filter((p) => {
        if (!p.variantes || p.variantes.length === 0) return false;
        return p.variantes.some(v => coloresSeleccionados.includes(v.color));
      });
    }
    
    // Filtro por talles
    if (tallesSeleccionados.length > 0) {
      r = r.filter((p) => {
        if (!p.variantes || p.variantes.length === 0) return false;
        return p.variantes.some(v => tallesSeleccionados.includes(v.talle));
      });
    }
    
    // Filtro por rango de precios
    if (precioMin) {
      const min = parseFloat(precioMin);
      if (!isNaN(min)) {
        r = r.filter((p) => p.price >= min);
      }
    }
    if (precioMax) {
      const max = parseFloat(precioMax);
      if (!isNaN(max)) {
        r = r.filter((p) => p.price <= max);
      }
    }
    
    // Ordenamiento
    switch (ordenamiento) {
      case "price-asc":
        r.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        r.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        r.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        // Orden por defecto (por fecha de creación descendente)
        r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFiltrados(r);
    setPaginaActual(1);
  };

  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    aplicarFiltrosYOrden();
  }, [search, categoria, coloresSeleccionados, tallesSeleccionados, precioMin, precioMax, ordenamiento, productos]);

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

  // Manejar selección de color
  const toggleColor = (color) => {
    setColoresSeleccionados(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  // Manejar selección de talle
  const toggleTalle = (talle) => {
    setTallesSeleccionados(prev =>
      prev.includes(talle)
        ? prev.filter(t => t !== talle)
        : [...prev, talle]
    );
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearch("");
    setCategoria("");
    setColoresSeleccionados([]);
    setTallesSeleccionados([]);
    setPrecioMin("");
    setPrecioMax("");
    setOrdenamiento("default");
  };

  // Cálculos de paginación
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPagina = filtrados.slice(indicePrimerProducto, indiceUltimoProducto);
  const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      cambiarPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      cambiarPagina(paginaActual + 1);
    }
  };

  const obtenerNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 5;
    
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) numeros.push(i);
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    return numeros;
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
        {/* Filtros principales */}
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
          
          <button
            className={`${styles.filterToggleBtn} ${filtrosAvanzados ? styles.filterToggleActive : ""}`}
            onClick={() => setFiltrosAvanzados(!filtrosAvanzados)}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filtros</span>
          </button>
          
          <div className={styles.sortSelect}>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className={styles.sortInput}
            >
              <option value="default">Relevancia</option>
              <option value="newest">Más nuevos</option>
              <option value="oldest">Más antiguos</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>
          
          <p className={styles.count}>
            Mostrando {productosPagina.length} de {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        
        {/* Filtros avanzados */}
        {filtrosAvanzados && (
          <div className={styles.advancedFilters}>
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Colores</h4>
                <div className={styles.colorGrid}>
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorFilterBtn} ${coloresSeleccionados.includes(color) ? styles.colorFilterActive : ""}`}
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Talles</h4>
                <div className={styles.talleGrid}>
                  {tallesDisponibles.map((talle) => (
                    <button
                      key={talle}
                      className={`${styles.talleFilterBtn} ${tallesSeleccionados.includes(talle) ? styles.talleFilterActive : ""}`}
                      onClick={() => toggleTalle(talle)}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Rango de precios</h4>
                <div className={styles.priceRange}>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    className={styles.priceInput}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    className={styles.priceInput}
                  />
                </div>
              </div>
            </div>
            
            <button className={styles.clearFiltersBtn} onClick={limpiarFiltros}>
              <FontAwesomeIcon icon={faTimes} />
              Limpiar filtros
            </button>
          </div>
        )}
        
        {filtrados.length === 0 ? (
          <div className={styles.empty}>
            <p>No se encontraron productos</p>
            <button className={styles.emptyBtn} onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {productosPagina.map((p) => (
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
            
            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <div className={styles.pageNumbers}>
                  {obtenerNumerosPagina().map((num, index) => (
                    <button
                      key={index}
                      className={`${styles.pageNumber} ${num === paginaActual ? styles.pageActive : ''} ${num === '...' ? styles.pageDots : ''}`}
                      onClick={() => num !== '...' && cambiarPagina(num)}
                      disabled={num === '...'}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <button
                  className={styles.pageBtn}
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Productos;