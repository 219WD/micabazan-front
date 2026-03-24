import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faArrowLeft, faStore, faTruck,
  faCreditCard, faBuilding, faCopy, faCheck,
  faCloudArrowUp, faSpinner, faFileImage,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { carritoAPI, mercadopagoAPI } from "../../api/carritoAPI";
import { uploadAPI } from "../../api/uploadAPI";
import { formatPrice } from "../../config";
import styles from "./Checkout.module.css";

// ─── Datos bancarios ──────────────────────────────────────────────────────────
const BANK = {
  titular: "Micaela Bazan",
  banco:   "BBVA Francés",
  alias:   "micabazan",
  cbu:     "000245654656456",
};

const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero",
  "Tierra del Fuego","Tucumán"
];

// ─── Hook: copiar al portapapeles ─────────────────────────────────────────────
const useCopy = () => {
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
};

const Checkout = () => {
  const { items, cartId, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { copied, copy } = useCopy();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("retiro");
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [address, setAddress] = useState({
    name: user?.name || "", address: "", apartment: "",
    city: "", province: "", postalCode: "", phone: "", extraNotes: "",
  });

  // ─── Estado del comprobante ────────────────────────────────────────────────
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptName, setReceiptName] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receiptError, setReceiptError] = useState(null);

  // ─── Subir comprobante ─────────────────────────────────────────────────────
  const handleReceiptFile = async (file) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf   = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      setReceiptError("Solo se permiten imágenes o PDF");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setReceiptError("El archivo no puede superar los 15MB");
      return;
    }

    setReceiptError(null);
    setUploadingReceipt(true);
    setUploadProgress(0);

    try {
      const result = await uploadAPI.uploadToCloudinary(
        file,
        "comprobantes",
        setUploadProgress
      );
      setReceiptUrl(result.url);
      setReceiptName(file.name);
    } catch (err) {
      setReceiptError("Error al subir el comprobante. Intentá de nuevo.");
    } finally {
      setUploadingReceipt(false);
      setUploadProgress(0);
    }
  };

  const handleNextStep = () => {
    if (deliveryMethod === "envio") {
      const { name, address: addr, city, province, postalCode, phone } = address;
      if (!name || !addr || !city || !province || !postalCode || !phone) {
        setError("Completá todos los campos obligatorios (*)");
        return;
      }
    }
    setError(null);
    setStep(2);
  };

  const handleConfirm = async () => {
    // Transferencia requiere comprobante
    if (paymentMethod === "transferencia" && !receiptUrl) {
      setError("Adjuntá el comprobante de transferencia para continuar");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: cart } = await carritoAPI.checkout(cartId, {
        paymentMethod,
        deliveryMethod,
        shippingAddress: deliveryMethod === "envio" ? address : null,
        receiptUrl: receiptUrl || undefined,
      });

      if (paymentMethod === "mercadopago") {
        const { data: mp } = await mercadopagoAPI.crearPreferencia(cart._id);
        window.location.href = mp.init_point;
      } else {
        clearCart();
        navigate("/mis-pedidos", {
          state: { message: "¡Pedido confirmado! Verificaremos tu pago en las próximas horas." }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) { navigate("/carrito"); return null; }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="label">Finalizar compra</p>
          <h1 className={styles.title}>Checkout</h1>
        </div>

        {/* Steps */}
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}>
            <span className={styles.stepNum}>01</span><span>Entrega</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}>
            <span className={styles.stepNum}>02</span><span>Pago</span>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>

            {/* ── STEP 1: Entrega ─────────────────────────────────────────── */}
            {step === 1 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>¿Cómo recibís tu pedido?</p>
                <div className={styles.options}>
                  <label className={`${styles.option} ${deliveryMethod === "retiro" ? styles.optionActive : ""}`}>
                    <input type="radio" value="retiro" checked={deliveryMethod === "retiro"} onChange={() => setDeliveryMethod("retiro")} hidden />
                    <FontAwesomeIcon icon={faStore} className={styles.optionIcon} />
                    <div><strong>Retiro en local</strong><p>España 984 – Rosario, Santa Fe</p></div>
                    <span className={styles.optionCheck}>{deliveryMethod === "retiro" ? "●" : "○"}</span>
                  </label>
                  <label className={`${styles.option} ${deliveryMethod === "envio" ? styles.optionActive : ""}`}>
                    <input type="radio" value="envio" checked={deliveryMethod === "envio"} onChange={() => setDeliveryMethod("envio")} hidden />
                    <FontAwesomeIcon icon={faTruck} className={styles.optionIcon} />
                    <div><strong>Envío a domicilio</strong><p>A coordinar por WhatsApp</p></div>
                    <span className={styles.optionCheck}>{deliveryMethod === "envio" ? "●" : "○"}</span>
                  </label>
                </div>

                {deliveryMethod === "envio" && (
                  <div className={styles.addressForm}>
                    <p className={styles.addressLabel}>Dirección de envío</p>
                    <div className={styles.formGrid}>
                      <div className={styles.field}><label>Receptor *</label><input name="name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Nombre completo" /></div>
                      <div className={styles.field}><label>Teléfono *</label><input name="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="1155667788" /></div>
                      <div className={`${styles.field} ${styles.full}`}><label>Calle y número *</label><input name="address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} placeholder="Av. Siempreviva 742" /></div>
                      <div className={styles.field}><label>Piso / Dpto</label><input name="apartment" value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} placeholder="3B" /></div>
                      <div className={styles.field}><label>Ciudad *</label><input name="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Localidad" /></div>
                      <div className={styles.field}><label>Provincia *</label>
                        <select name="province" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })}>
                          <option value="">Seleccioná</option>
                          {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}><label>Código postal *</label><input name="postalCode" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} placeholder="1425" /></div>
                      <div className={`${styles.field} ${styles.full}`}><label>Referencias</label><input name="extraNotes" value={address.extraNotes} onChange={(e) => setAddress({ ...address, extraNotes: e.target.value })} placeholder="Portón verde..." /></div>
                    </div>
                  </div>
                )}

                {error && <p className="alert alert-error">{error}</p>}
                <button className="btn btn-primary" onClick={handleNextStep}>
                  Continuar al pago <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
                </button>
              </div>
            )}

            {/* ── STEP 2: Pago ────────────────────────────────────────────── */}
            {step === 2 && (
              <div className={styles.section}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} /> Volver
                </button>
                <p className={styles.sectionLabel}>¿Cómo pagás?</p>

                <div className={styles.options}>
                  <label className={`${styles.option} ${paymentMethod === "mercadopago" ? styles.optionActive : ""}`}>
                    <input type="radio" value="mercadopago" checked={paymentMethod === "mercadopago"} onChange={() => setPaymentMethod("mercadopago")} hidden />
                    <FontAwesomeIcon icon={faCreditCard} className={styles.optionIcon} />
                    <div><strong>MercadoPago</strong><p>Tarjeta, débito o saldo en cuenta</p></div>
                    <span className={styles.optionCheck}>{paymentMethod === "mercadopago" ? "●" : "○"}</span>
                  </label>
                  <label className={`${styles.option} ${paymentMethod === "transferencia" ? styles.optionActive : ""}`}>
                    <input type="radio" value="transferencia" checked={paymentMethod === "transferencia"} onChange={() => setPaymentMethod("transferencia")} hidden />
                    <FontAwesomeIcon icon={faBuilding} className={styles.optionIcon} />
                    <div><strong>Transferencia bancaria</strong><p>Confirmamos en 24hs hábiles</p></div>
                    <span className={styles.optionCheck}>{paymentMethod === "transferencia" ? "●" : "○"}</span>
                  </label>
                </div>

                {/* ── Datos bancarios ────────────────────────────────────── */}
                {paymentMethod === "transferencia" && (
                  <div className={styles.bankBox}>
                    <p className={styles.bankTitle}>Datos para la transferencia</p>

                    <div className={styles.bankRows}>
                      <div className={styles.bankRow}>
                        <span className={styles.bankLabel}>Titular</span>
                        <span className={styles.bankVal}>{BANK.titular}</span>
                      </div>
                      <div className={styles.bankRow}>
                        <span className={styles.bankLabel}>Banco</span>
                        <span className={styles.bankVal}>{BANK.banco}</span>
                      </div>
                      <div className={styles.bankRow}>
                        <span className={styles.bankLabel}>Alias</span>
                        <div className={styles.bankCopy}>
                          <span className={styles.bankVal}>{BANK.alias}</span>
                          <button
                            type="button"
                            className={`${styles.copyBtn} ${copied === "alias" ? styles.copyDone : ""}`}
                            onClick={() => copy(BANK.alias, "alias")}
                          >
                            <FontAwesomeIcon icon={copied === "alias" ? faCheck : faCopy} />
                            {copied === "alias" ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      </div>
                      <div className={styles.bankRow}>
                        <span className={styles.bankLabel}>CBU</span>
                        <div className={styles.bankCopy}>
                          <span className={`${styles.bankVal} ${styles.bankMono}`}>{BANK.cbu}</span>
                          <button
                            type="button"
                            className={`${styles.copyBtn} ${copied === "cbu" ? styles.copyDone : ""}`}
                            onClick={() => copy(BANK.cbu, "cbu")}
                          >
                            <FontAwesomeIcon icon={copied === "cbu" ? faCheck : faCopy} />
                            {copied === "cbu" ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      </div>
                      <div className={styles.bankRow}>
                        <span className={styles.bankLabel}>Monto exacto</span>
                        <span className={`${styles.bankVal} ${styles.bankAmount}`}>
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* ── Upload comprobante ─────────────────────────────── */}
                    <div className={styles.receiptSection}>
                      <p className={styles.receiptTitle}>
                        Adjuntá tu comprobante <span className={styles.req}>*</span>
                      </p>
                      <p className={styles.receiptHint}>
                        Foto o PDF del comprobante de transferencia
                      </p>

                      {receiptUrl ? (
                        /* Comprobante subido */
                        <div className={styles.receiptDone}>
                          <FontAwesomeIcon icon={faCheck} className={styles.receiptCheck} />
                          <div>
                            <p className={styles.receiptDoneTitle}>Comprobante adjuntado</p>
                            <p className={styles.receiptDoneName}>{receiptName}</p>
                          </div>
                          <button
                            type="button"
                            className={styles.receiptChange}
                            onClick={() => { setReceiptUrl(null); setReceiptName(null); }}
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : uploadingReceipt ? (
                        /* Subiendo */
                        <div className={styles.receiptUploading}>
                          <FontAwesomeIcon icon={faSpinner} spin className={styles.receiptSpinner} />
                          <div className={styles.receiptProgress}>
                            <p>Subiendo... {uploadProgress}%</p>
                            <div className={styles.progressBar}>
                              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Drop zone comprobante */
                        <label className={styles.receiptZone}>
                          <FontAwesomeIcon icon={faFileImage} className={styles.receiptIcon} />
                          <span className={styles.receiptZoneText}>Tocá para adjuntar</span>
                          <span className={styles.receiptZoneSub}>JPG, PNG, PDF · Máx 15MB</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleReceiptFile(e.target.files?.[0])}
                            className={styles.hiddenInput}
                            capture="environment"
                          />
                        </label>
                      )}

                      {receiptError && <p className={styles.receiptError}>{receiptError}</p>}
                    </div>
                  </div>
                )}

                {error && <p className="alert alert-error">{error}</p>}

                <button
                  className={`btn ${paymentMethod === "mercadopago" ? "btn-primary" : "btn-accent"}`}
                  onClick={handleConfirm}
                  disabled={loading || (paymentMethod === "transferencia" && !receiptUrl)}
                  style={{ opacity: paymentMethod === "transferencia" && !receiptUrl ? 0.5 : 1 }}
                >
                  {loading
                    ? "Procesando..."
                    : paymentMethod === "mercadopago"
                    ? "Ir a MercadoPago"
                    : "Confirmar pedido"}
                  {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />}
                </button>

                {paymentMethod === "transferencia" && !receiptUrl && (
                  <p className={styles.receiptRequired}>
                    Adjuntá el comprobante para poder confirmar el pedido
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Resumen ──────────────────────────────────────────────────── */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Tu pedido</p>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.productId} className={styles.summaryItem}>
                  <div className={styles.summaryImg}>
                    <img src={item.image} alt={item.title}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                  <div className={styles.summaryInfo}>
                    <p className={styles.summaryName}>{item.title}</p>
                    <p className={styles.summaryQty}>x{item.quantity}</p>
                  </div>
                  <span className={styles.summaryPrice}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
            {deliveryMethod === "envio" && (
              <p className={styles.shippingNote}>* Envío a coordinar por separado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;