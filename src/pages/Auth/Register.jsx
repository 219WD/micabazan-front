import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.label}>Crear cuenta</p>
          <h1 className={styles.title}>Registrate</h1>
          <p className={styles.subtitle}>Solo tres campos, sin complicaciones</p>
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tu nombre" required autoComplete="name" />
          </div>
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
              placeholder="Mínimo 6 caracteres" required minLength={6} autoComplete="new-password" />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Creando cuenta..." : <>Crear cuenta <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} /></>}
          </button>
        </form>

        <hr className={styles.divider} />
        <p className={styles.switch}>
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;