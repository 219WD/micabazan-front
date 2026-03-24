import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { carritoAPI } from "../../api/carritoAPI";
import { formatPrice } from "../../config";
import styles from "./MisPedidos.module.css";

const STATUS = {
  inicializado: { label: "Borrador",          color: "var(--muted-light)" },
  pendiente:    { label: "Pendiente de pago",  color: "var(--stone)" },
  pagado:       { label: "Pago confirmado",    color: "#6B8EA8" },
  preparacion:  { label: "En preparación",     color: "#8A7BA0" },
  en_camino:    { label: "En camino",           color: "#5A8A8A" },
  entregado:    { label: "Entregado",           color: "var(--color-success)" },
  cancelado:    { label: "Cancelado",           color: "var(--color-error)" },
};

const MisPedidos = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [comprobante, setComprobante] = useState({});
  const [subiendoId, setSubiendoId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await carritoAPI.getByUser(user._id);
        const filtrados = data
          .filter((p) => p.status !== "inicializado")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPedidos(filtrados);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [user._id]);

  const handleSubirComprobante = async (cartId) => {
    const url = comprobante[cartId];
    if (!url) return;
    setSubiendoId(cartId);
    try {
      await carritoAPI.uploadReceipt(cartId, url);
      setPedidos((prev) => prev.map((p) => p._id === cartId ? { ...p, receiptUrl: url } : p));
      setComprobante({ ...comprobante, [cartId]: "" });
      setSuccessMsg("Comprobante guardado. Lo revisaremos pronto.");
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar");
    } finally { setSubiendoId(null); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="label">Tu historial</p>
          <h1 className={styles.title}>Mis pedidos</h1>
        </div>

        {successMsg && (
          <p className="alert alert-success" style={{ marginBottom: "var(--s6)" }}>{successMsg}</p>
        )}

        {pedidos.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Todavía no hiciste ningún pedido</h2>
            <p className={styles.emptyText}>Cuando realices una compra, la vas a ver acá</p>
          </div>
        ) : (
          <div className={styles.list}>
            {pedidos.map((pedido) => {
              const st = STATUS[pedido.status] || { label: pedido.status, color: "var(--muted)" };
              const isOpen = expandido === pedido._id;

              return (
                <div key={pedido._id} className={styles.card}>
                  <div className={styles.cardHeader} onClick={() => setExpandido(isOpen ? null : pedido._id)}>
                    <div className={styles.cardLeft}>
                      <p className={styles.orderId}>#{pedido._id.slice(-8).toUpperCase()}</p>
                      <p className={styles.orderDate}>{new Date(pedido.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className={styles.cardRight}>
                      <span className={styles.statusDot} style={{ color: st.color }}>● {st.label}</span>
                      <span className={styles.orderTotal}>{formatPrice(pedido.totalAmount)}</span>
                      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className={styles.chevron} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.cardBody}>
                      <div className={styles.metaRow}>
                        <span className="label">Entrega</span>
                        <span className={styles.metaVal}>{pedido.deliveryMethod === "envio" ? "Envío a domicilio" : "Retiro en local"}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className="label">Pago</span>
                        <span className={styles.metaVal}>{pedido.paymentMethod === "mercadopago" ? "MercadoPago" : pedido.paymentMethod === "transferencia" ? "Transferencia" : "—"}</span>
                      </div>

                      {pedido.shippingAddress && (
                        <div className={styles.addressBox}>
                          <p className={styles.addressTitle}>Dirección de envío</p>
                          <p className={styles.addressText}>
                            {pedido.shippingAddress.address}
                            {pedido.shippingAddress.apartment ? `, ${pedido.shippingAddress.apartment}` : ""}<br />
                            {pedido.shippingAddress.city}, {pedido.shippingAddress.province} ({pedido.shippingAddress.postalCode})<br />
                            Tel: {pedido.shippingAddress.phone}
                          </p>
                        </div>
                      )}

                      <div className={styles.items}>
                        {pedido.items.map((item, i) => (
                          <div key={i} className={styles.item}>
                            {item.productId?.image && (
                              <div className={styles.itemImg}>
                                <img src={item.productId.image} alt={item.productId?.title}
                                  onError={(e) => { e.target.style.display = "none"; }} />
                              </div>
                            )}
                            <span className={styles.itemName}>{item.productId?.title || "Producto eliminado"}</span>
                            <span className={styles.itemQty}>x{item.quantity}</span>
                            <span className={styles.itemPrice}>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Comprobante */}
                      {pedido.paymentMethod === "transferencia" && pedido.status === "pendiente" && (
                        <div className={styles.receipt}>
                          {pedido.receiptUrl ? (
                            <p className="alert alert-success">✓ Comprobante enviado. Verificando pago.</p>
                          ) : (
                            <div className={styles.receiptForm}>
                              <p className={styles.receiptLabel}>Subí el link de tu comprobante de transferencia</p>
                              <div className={styles.receiptInput}>
                                <input
                                  type="url"
                                  placeholder="https://... (link de imagen)"
                                  value={comprobante[pedido._id] || ""}
                                  onChange={(e) => setComprobante({ ...comprobante, [pedido._id]: e.target.value })}
                                />
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSubirComprobante(pedido._id)}
                                  disabled={subiendoId === pedido._id || !comprobante[pedido._id]}
                                >
                                  <FontAwesomeIcon icon={faArrowUpFromBracket} />
                                  {subiendoId === pedido._id ? "..." : "Enviar"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;