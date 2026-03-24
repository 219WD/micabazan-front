import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faXmark, faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../config";
import styles from "./Carrito.module.css";

const Carrito = () => {
  const { items, totalAmount, updateItem, loading } = useCart();
  const { isLogged } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isLogged) navigate("/login", { state: { from: "/checkout" } });
    else navigate("/checkout");
  };

  if (items.length === 0) return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Tu carrito está vacío</h2>
          <p className={styles.emptyText}>Explorá nuestros productos y encontrá algo que te guste</p>
          <button className="btn btn-primary" onClick={() => navigate("/productos")}>
            Ver productos <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="label">Tu selección</p>
          <h1 className={styles.title}>Carrito</h1>
        </div>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <div className={styles.itemImg}
                  onClick={() => navigate(`/productos/${item.productId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/100x120?text=."; }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.title}</p>
                  <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  <div className={styles.itemControls}>
                    <div className={styles.qty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateItem(item.productId, "subtract")}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateItem(item.productId, "add")}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <span className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => updateItem(item.productId, "remove")}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}

            <button className={styles.continueBtn} onClick={() => navigate("/productos")}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} />
              Seguir comprando
            </button>
          </div>

          {/* Resumen */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Resumen del pedido</p>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span className={styles.shippingNote}>A coordinar</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <button
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={handleCheckout}
              disabled={loading}
            >
              {isLogged ? "Continuar compra" : "Iniciar sesión para comprar"}
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </button>

            {!isLogged && (
              <p className={styles.guestNote}>
                ¿Ya tenés cuenta? <span onClick={() => navigate("/login")} className={styles.loginLink}>Ingresá</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;