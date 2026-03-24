import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/authAPI";
import styles from "./Perfil.module.css";

const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero",
  "Tierra del Fuego","Tucumán"
];

const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("datos");
  const [datos, setDatos] = useState({ name: user.name, email: user.email });
  const [address, setAddress] = useState({
    name: user.savedAddress?.name || "", address: user.savedAddress?.address || "",
    apartment: user.savedAddress?.apartment || "", city: user.savedAddress?.city || "",
    province: user.savedAddress?.province || "", postalCode: user.savedAddress?.postalCode || "",
    phone: user.savedAddress?.phone || "", extraNotes: user.savedAddress?.extraNotes || "",
  });
  const [pass, setPass] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleDatos = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateMe(datos);
      updateUser(data.user);
      showMsg("success", "Datos actualizados correctamente");
    } catch (err) {
      showMsg("error", err.response?.data?.error || "Error al guardar");
    } finally { setLoading(false); }
  };

  const handleAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateAddress(address);
      updateUser({ savedAddress: address });
      showMsg("success", "Dirección guardada correctamente");
    } catch (err) {
      showMsg("error", err.response?.data?.error || "Error al guardar");
    } finally { setLoading(false); }
  };

  const handlePass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.changePassword(pass);
      setPass({ currentPassword: "", newPassword: "" });
      showMsg("success", "Contraseña actualizada correctamente");
    } catch (err) {
      showMsg("error", err.response?.data?.error || "Error al cambiar contraseña");
    } finally { setLoading(false); }
  };

  const TABS = [
    { id: "datos", label: "Mis datos" },
    { id: "direccion", label: "Dirección" },
    { id: "seguridad", label: "Seguridad" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="label">{user.role}</p>
          <h1 className={styles.title}>Mi perfil</h1>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => { setTab(t.id); setMsg(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && <p className={`alert alert-${msg.type}`} style={{ marginBottom: "var(--s6)" }}>{msg.text}</p>}

        <div className={styles.content}>
          {tab === "datos" && (
            <form onSubmit={handleDatos} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre</label>
                <input value={datos.name} onChange={(e) => setDatos({ ...datos, name: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ alignSelf: "flex-start" }}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          )}

          {tab === "direccion" && (
            <form onSubmit={handleAddress} className={styles.form}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Nombre del receptor</label>
                  <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Nombre completo" />
                </div>
                <div className={styles.field}>
                  <label>Teléfono</label>
                  <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="1155667788" />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Calle y número</label>
                  <input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} placeholder="Av. Siempreviva 742" />
                </div>
                <div className={styles.field}>
                  <label>Piso / Dpto</label>
                  <input value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} placeholder="3B" />
                </div>
                <div className={styles.field}>
                  <label>Ciudad</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Localidad" />
                </div>
                <div className={styles.field}>
                  <label>Provincia</label>
                  <select value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })}>
                    <option value="">Seleccioná</option>
                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Código postal</label>
                  <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} placeholder="1425" />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Referencias</label>
                  <input value={address.extraNotes} onChange={(e) => setAddress({ ...address, extraNotes: e.target.value })} placeholder="Portón verde..." />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start" }}>
                {loading ? "Guardando..." : "Guardar dirección"}
              </button>
            </form>
          )}

          {tab === "seguridad" && (
            <form onSubmit={handlePass} className={styles.form}>
              <div className={styles.field}>
                <label>Contraseña actual</label>
                <input type="password" value={pass.currentPassword}
                  onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label>Nueva contraseña</label>
                <input type="password" value={pass.newPassword}
                  onChange={(e) => setPass({ ...pass, newPassword: e.target.value })}
                  required minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start" }}>
                {loading ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;