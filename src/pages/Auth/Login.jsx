import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.label}>Bienvenido</p>
          <h1 className={styles.title}>Iniciá sesión</h1>
          <p className={styles.subtitle}>Ingresá para continuar con tu compra</p>
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com" required autoComplete="email" />
          </div>
          <div className={styles.field}>
            <label>Contraseña</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <Link to="/reset-password" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Ingresando..." : <>Ingresar <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} /></>}
          </button>
        </form>

        <hr className={styles.divider} />
        <p className={styles.switch}>
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;