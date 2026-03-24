import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { authAPI } from "../../api/authAPI";
import styles from "./Auth.module.css";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.requestResetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.label}>Seguridad</p>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.subtitle}>Ingresá tu email y te enviamos un enlace para restablecer tu contraseña</p>
        </div>

        {sent ? (
          <div className={styles.success}>
            <p className="alert alert-success">
              Si el email existe, recibirás un enlace en tu casilla de correo.
            </p>
            <Link to="/login" className={styles.btn} style={{ textAlign: "center", textDecoration: "none" }}>
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            {error && <p className="alert alert-error">{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" required />
              </div>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Enviando..." : <>Enviar enlace <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} /></>}
              </button>
            </form>
          </>
        )}

        <hr className={styles.divider} />
        <p className={styles.switch}><Link to="/login">← Volver al login</Link></p>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;