import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faPen, faTrash, faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { productosAPI } from "../../../api/productosAPI";
import { formatPrice } from "../../../config";
import ImageUploader from "../../../components/ui/ImageUploader";
import MultiImageUploader from "../../../components/ui/MultiImageUploader";
import styles from "./AdminTabs.module.css";

const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

// Estructura para una variante individual
const emptyVariante = {
  talle: null,
  color: null,
  stock: 0
};

const emptyForm = {
  title: "", 
  image: "", 
  additionalImages: [],
  description: "", 
  stock: "", 
  price: "", 
  precioAntes: "",
  category: "", 
  isUsd: false, 
  variantes: []
};

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [modoVariantes, setModoVariantes] = useState(false);
  const [originalMode, setOriginalMode] = useState(null); // Guardar modo original del producto

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      const { data } = await productosAPI.getAll();
      setProductos(data);
    } catch { setError("Error al cargar productos"); }
    finally { setLoading(false); }
  };

  // Calcular stock total desde variantes
  const calcularStockTotal = (variantes) => {
    return variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  // Convertir stock simple a variante inicial
  const convertirStockSimpleAVariante = (stockSimple) => {
    if (stockSimple && stockSimple > 0) {
      return [{
        talle: null,
        color: null,
        stock: Number(stockSimple)
      }];
    }
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) { setError("La imagen de portada es obligatoria"); return; }
    setFormLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        image: form.image,
        additionalImages: form.additionalImages || [],
        description: form.description?.trim() || "",
        price: Number(form.price),
        precioAntes: form.precioAntes ? Number(form.precioAntes) : null,
        category: form.category?.trim() || null,
        isUsd: form.isUsd,
      };

      // Si estamos en modo variantes
      if (modoVariantes) {
        // Validar que haya al menos una variante con stock
        const variantesValidas = form.variantes.filter(v => v.stock > 0);
        if (variantesValidas.length === 0) {
          setError("Al menos una variante debe tener stock mayor a 0");
          setFormLoading(false);
          return;
        }
        payload.variantes = variantesValidas;
      } else {
        // Modo simple
        if (!form.stock && form.stock !== 0) {
          setError("El stock es obligatorio en modo simple");
          setFormLoading(false);
          return;
        }
        payload.stock = Number(form.stock);
        payload.variantes = [];
      }

      if (editId) {
        await productosAPI.update(editId, payload);
      } else {
        await productosAPI.create(payload);
      }
      
      resetForm();
      setShowForm(false);
      fetchProductos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally { setFormLoading(false); }
  };

  const handleEdit = (p) => {
    const tieneVariantes = p.variantes && p.variantes.length > 0;
    
    // Preparar el formulario con los datos del producto
    const editForm = {
      title: p.title || "",
      image: p.image || "",
      additionalImages: p.additionalImages || [],
      description: p.description || "",
      stock: p.stock || "",
      price: p.price || "",
      precioAntes: p.precioAntes || "",
      category: p.category || "",
      isUsd: p.isUsd || false,
      variantes: tieneVariantes ? p.variantes.map(v => ({ 
        talle: v.talle || null,
        color: v.color || null,
        stock: v.stock || 0
      })) : []
    };
    
    setForm(editForm);
    setModoVariantes(tieneVariantes);
    setOriginalMode(tieneVariantes ? "variantes" : "simple");
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para convertir de simple a variantes
  const convertirAVariantes = () => {
    if (!form.stock && form.stock !== 0) {
      setError("No hay stock para convertir");
      return;
    }
    
    if (confirm(`¿Convertir este producto a modo variantes? El stock actual (${form.stock} unidades) se convertirá en una variante base que podrás editar.`)) {
      const nuevaVariante = [{
        talle: null,
        color: null,
        stock: Number(form.stock)
      }];
      
      setForm({
        ...form,
        variantes: nuevaVariante,
        stock: "" // Limpiar stock simple
      });
      setModoVariantes(true);
      setError(null);
    }
  };

  // Manejo de variantes en el formulario
  const agregarVariante = () => {
    setForm({
      ...form,
      variantes: [...form.variantes, { ...emptyVariante }]
    });
  };

  const actualizarVariante = (index, campo, valor) => {
    const nuevasVariantes = [...form.variantes];
    nuevasVariantes[index] = { ...nuevasVariantes[index], [campo]: valor };
    setForm({ ...form, variantes: nuevasVariantes });
  };

  const eliminarVariante = (index) => {
    const nuevasVariantes = form.variantes.filter((_, i) => i !== index);
    setForm({ ...form, variantes: nuevasVariantes });
  };

  const handleToggle = async (id) => {
    try { await productosAPI.toggleStatus(id); fetchProductos(); }
    catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const handleToggleFeatured = async (id) => {
    try { await productosAPI.toggleFeatured(id); fetchProductos(); }
    catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await productosAPI.delete(id); fetchProductos(); }
    catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setError(null);
    setModoVariantes(false);
    setOriginalMode(null);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className={styles.toolbar}>
        <button
          className={`btn ${showForm ? "btn-ghost" : "btn-primary"} btn-sm`}
          onClick={() => { 
            if (showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          {showForm
            ? <><FontAwesomeIcon icon={faXmark} /> Cancelar</>
            : <><FontAwesomeIcon icon={faPlus} /> Nuevo producto</>}
        </button>
        <span className={styles.count}>{productos.length} productos</span>
      </div>

      {/* ─── Formulario ─────────────────────────────────────────────────────── */}
      {showForm && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>
            {editId ? "Editar producto" : "Nuevo producto"}
          </p>
          {error && <p className="alert alert-error">{error}</p>}

          {/* Selector de modo - Siempre visible para edición */}
          {(!editId || originalMode === "simple") && (
            <div className={styles.modeSelector}>
              <button
                type="button"
                className={`${styles.modeBtn} ${!modoVariantes ? styles.modeActive : ""}`}
                onClick={() => {
                  if (editId && originalMode === "simple" && modoVariantes) {
                    // Si estaba en simple y quiere volver, preguntar
                    if (confirm("¿Volver a modo simple? Las variantes creadas se perderán.")) {
                      setModoVariantes(false);
                      setForm({
                        ...form,
                        variantes: [],
                        stock: form.variantes.reduce((sum, v) => sum + v.stock, 0) || ""
                      });
                    }
                  } else {
                    setModoVariantes(false);
                    if (!editId) {
                      setForm({ ...form, variantes: [], stock: "" });
                    }
                  }
                }}
                disabled={editId && originalMode === "variantes"}
              >
                Modo simple (stock único)
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${modoVariantes ? styles.modeActive : ""}`}
                onClick={() => {
                  if (editId && originalMode === "simple" && !modoVariantes) {
                    convertirAVariantes();
                  } else {
                    setModoVariantes(true);
                    if (!editId) {
                      setForm({ ...form, stock: "", variantes: [] });
                    }
                  }
                }}
                disabled={editId && originalMode === "variantes"}
              >
                Modo variantes (talle/color)
              </button>
            </div>
          )}

          {/* Mensaje informativo para productos en modo simple con opción de convertir */}
          {editId && originalMode === "simple" && !modoVariantes && (
            <div className={styles.infoMessageConvert}>
              <p>ℹ️ Este producto está en modo simple. Puedes <strong>convertirlo a modo variantes</strong> para manejar talles y colores.</p>
              <button 
                type="button"
                onClick={convertirAVariantes}
                className={styles.convertBtn}
              >
                <FontAwesomeIcon icon={faExchangeAlt} /> Convertir a variantes
              </button>
            </div>
          )}

          {/* Mensaje para productos en modo variantes */}
          {editId && originalMode === "variantes" && (
            <div className={styles.infoMessageVariantes}>
              <p>✅ Este producto ya usa variantes. Puedes editar las combinaciones existentes o agregar nuevas.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>

              {/* Título y categoría */}
              <div className={styles.field}>
                <label>Título *</label>
                <input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label>Categoría</label>
                <input 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  placeholder="trajes-de-bano, deportiva..." 
                />
              </div>

              {/* Descripción */}
              <div className={`${styles.field} ${styles.full}`}>
                <label>Descripción</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                />
              </div>

              {/* Precios */}
              <div className={styles.field}>
                <label>Precio actual *</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={form.price} 
                  onChange={(e) => setForm({ ...form, price: e.target.value })} 
                  required 
                  placeholder="5000" 
                />
              </div>

              <div className={styles.field}>
                <label>Precio antes <span className={styles.optional}>(opcional)</span></label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={form.precioAntes} 
                  onChange={(e) => setForm({ ...form, precioAntes: e.target.value })} 
                  placeholder="7000" 
                />
              </div>

              {/* Precio en USD */}
              <div className={styles.field}>
                <label className={styles.checkLabel}>
                  <input 
                    type="checkbox" 
                    checked={form.isUsd} 
                    onChange={(e) => setForm({ ...form, isUsd: e.target.checked })} 
                  />
                  Precio en USD
                </label>
              </div>

              {/* Modo simple: stock único */}
              {!modoVariantes && (
                <div className={styles.field}>
                  <label>Stock *</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={form.stock} 
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                    required 
                  />
                </div>
              )}

              {/* Modo variantes: tabla de variantes */}
              {modoVariantes && (
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Variantes (talle + color + stock)</label>
                  <div className={styles.variantesTable}>
                    <div className={styles.variantesHeader}>
                      <span>Talle</span>
                      <span>Color</span>
                      <span>Stock</span>
                      <span></span>
                    </div>
                    {form.variantes.length === 0 && (
                      <div className={styles.emptyVariantes}>
                        <p>No hay variantes. Haz clic en "Agregar variante" para comenzar.</p>
                      </div>
                    )}
                    {form.variantes.map((v, idx) => (
                      <div key={idx} className={styles.varianteRow}>
                        <select 
                          value={v.talle || ""} 
                          onChange={(e) => actualizarVariante(idx, "talle", e.target.value || null)}
                          className={styles.selectSmall}
                        >
                          <option value="">Sin talle</option>
                          {TALLES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <input 
                          type="text"
                          placeholder="Color"
                          value={v.color || ""}
                          onChange={(e) => actualizarVariante(idx, "color", e.target.value || null)}
                          className={styles.inputSmall}
                        />
                        <input 
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => actualizarVariante(idx, "stock", parseInt(e.target.value) || 0)}
                          className={styles.inputSmall}
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => eliminarVariante(idx)}
                          className={styles.deleteVarianteBtn}
                          title="Eliminar variante"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={agregarVariante}
                      className={styles.addVarianteBtn}
                    >
                      <FontAwesomeIcon icon={faPlus} /> Agregar variante
                    </button>
                  </div>
                  {form.variantes.length > 0 && (
                    <p className={styles.stockTotal}>
                      Stock total: {calcularStockTotal(form.variantes)} unidades
                    </p>
                  )}
                </div>
              )}

              {/* Imagen portada */}
              <div className={`${styles.field} ${styles.full}`}>
                <ImageUploader
                  label="Foto de portada"
                  required
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url || "" })}
                  folder="productos"
                />
              </div>

              {/* Imágenes adicionales */}
              <div className={`${styles.field} ${styles.full}`}>
                <MultiImageUploader
                  label="Fotos adicionales (hasta 5)"
                  values={form.additionalImages}
                  onChange={(urls) => setForm({ ...form, additionalImages: urls })}
                  folder="productos"
                  max={5}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={formLoading || !form.image}
              >
                {formLoading ? "Guardando..." : editId ? "Guardar cambios" : "Crear producto"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Lista de productos ──────────────────────────────────────────── */}
      <div className={styles.prodList}>
        <div className={styles.prodHeader}>
          <span>Producto</span>
          <span>Precio</span>
          <span>Stock</span>
          <span>Estado</span>
          <span></span>
        </div>
        {productos.map((p) => {
          const tieneVariantes = p.variantes?.length > 0;
          return (
            <div key={p._id} className={styles.prodRow}>
              <div className={styles.prodInfo}>
                <div className={styles.prodImg}>
                  <img 
                    src={p.image} 
                    alt={p.title}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/40x50?text=."; }} 
                  />
                </div>
                <div>
                  <p className={styles.prodName}>{p.title}</p>
                  <div className={styles.prodMeta}>
                    {p.category && <span className={styles.prodCat}>{p.category}</span>}
                    {tieneVariantes && (
                      <span className={styles.prodVariantBadge} title={`${p.variantes.length} combinaciones disponibles`}>
                        📦 {p.variantes.length} variantes
                      </span>
                    )}
                    {!tieneVariantes && (
                      <span className={styles.prodSimpleBadge}>📦 Stock simple</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.prodPriceWrap}>
                {p.precioAntes && (
                  <span className={styles.prodPriceBefore}>{formatPrice(p.precioAntes, p.isUsd)}</span>
                )}
                <span className={styles.prodPrice}>{formatPrice(p.price, p.isUsd)}</span>
              </div>
              <span className={`${styles.prodStock} ${p.stock === 0 ? styles.noStock : ""}`}>
                {p.stock}
              </span>
              <span className={`${styles.prodStatus} ${p.isActive ? styles.active : styles.inactive}`}>
                {p.isActive ? "Activo" : "Inactivo"}
              </span>
              <div className={styles.prodActions}>
                <button className={styles.actionBtn} onClick={() => handleEdit(p)} title="Editar">
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button className={styles.actionBtn} onClick={() => handleToggle(p._id)} title={p.isActive ? "Desactivar" : "Activar"}>
                  {p.isActive ? "●" : "○"}
                </button>
                <button
                  className={`${styles.actionBtn} ${p.isFeatured ? styles.featured : ""}`}
                  onClick={() => handleToggleFeatured(p._id)}
                  title={p.isFeatured ? "Quitar destacado" : "Destacar"}
                >
                  ★
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p._id)} title="Eliminar">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProductos;