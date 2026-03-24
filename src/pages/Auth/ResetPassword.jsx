import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { authAPI } from "../../api/authAPI";
import styles from "./Auth.module.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Enlace inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.label}>Seguridad</p>
          <h1 className={styles.title}>Nueva contraseña</h1>
        </div>

        {done ? (
          <p className="alert alert-success">¡Contraseña actualizada! Redirigiendo...</p>
        ) : (
          <>
            {error && <p className="alert alert-error">{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Nueva contraseña</label>
                <input type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required minLength={6} autoComplete="new-password" />
              </div>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Guardando..." : <>Guardar <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} /></>}
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

export default ResetPassword;