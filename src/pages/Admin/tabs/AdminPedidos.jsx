import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { carritoAPI } from "../../../api/carritoAPI";
import { formatPrice } from "../../../config";
import styles from "./AdminTabs.module.css";

const STATUS_OPTIONS = ["pendiente","pagado","preparacion","en_camino","entregado","cancelado"];
const STATUS_LABEL = {
  inicializado:"Borrador", pendiente:"Pendiente", pagado:"Pagado",
  preparacion:"Preparación", en_camino:"En camino", entregado:"Entregado", cancelado:"Cancelado",
};
const STATUS_COLOR = {
  inicializado:"var(--muted-light)", pendiente:"var(--stone)", pagado:"#6B8EA8",
  preparacion:"#8A7BA0", en_camino:"#5A8A8A", entregado:"var(--color-success)", cancelado:"var(--color-error)",
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [cambiando, setCambiando] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await carritoAPI.getAll({ status: filtroStatus || undefined });
        setPedidos(data.carts || data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filtroStatus]);

  const handleStatusChange = async (cartId, newStatus) => {
    setCambiando(cartId);
    try {
      await carritoAPI.updateStatus(cartId, newStatus);
      setPedidos((prev) => prev.map((p) => p._id === cartId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar estado");
    } finally { setCambiando(null); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <span className="label">Estado:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={styles.select}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <span className={styles.count}>{pedidos.length} pedidos</span>
      </div>

      {pedidos.length === 0 ? (
        <p className={styles.empty}>No hay pedidos con ese filtro</p>
      ) : (
        <div className={styles.list}>
          {pedidos.map((p) => {
            const isOpen = expandido === p._id;
            return (
              <div key={p._id} className={styles.card}>
                <div
                  className={styles.cardHeader}
                  onClick={() => setExpandido(isOpen ? null : p._id)}
                >
                  <div className={styles.cardLeft}>
                    <span className={styles.orderId}>#{p._id.slice(-8).toUpperCase()}</span>
                    <span className={styles.orderMeta}>
                      {p.userId?.name || "—"} · {new Date(p.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <div className={styles.cardRight}>
                    <span
                      className={styles.statusDot}
                      style={{ color: STATUS_COLOR[p.status] }}
                    >
                      ● {STATUS_LABEL[p.status]}
                    </span>
                    <span className={styles.orderTotal}>{formatPrice(p.totalAmount)}</span>
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className={styles.chevron} />
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.cardBody}>
                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <span className="label">Email</span>
                        <span>{p.userId?.email || "—"}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className="label">Entrega</span>
                        <span className={styles.cap}>{p.deliveryMethod}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className="label">Pago</span>
                        <span className={styles.cap}>{p.paymentMethod || "—"}</span>
                      </div>
                    </div>

                    {p.shippingAddress && (
                      <div className={styles.addressBox}>
                        <p className={styles.addressLabel}>Dirección de envío</p>
                        <p className={styles.addressText}>
                          {p.shippingAddress.address}, {p.shippingAddress.city}, {p.shippingAddress.province} · Tel: {p.shippingAddress.phone}
                        </p>
                      </div>
                    )}

                    {p.receiptUrl && (
                      <div className={styles.receiptLink}>
                        <span className="label">Comprobante:</span>
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          Ver comprobante →
                        </a>
                      </div>
                    )}

                    <div className={styles.items}>
                      {p.items.map((item, i) => (
                        <div key={i} className={styles.item}>
                          <span className={styles.itemName}>{item.productId?.title || "Producto eliminado"}</span>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                          <span className={styles.itemPrice}>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.statusChange}>
                      <span className="label">Cambiar estado:</span>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                        disabled={cambiando === p._id || ["entregado","cancelado"].includes(p.status)}
                        className={styles.statusSelect}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                      {cambiando === p._id && <span className={styles.saving}>Guardando...</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;