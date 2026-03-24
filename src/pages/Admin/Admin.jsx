import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminPedidos from "./tabs/AdminPedidos";
import AdminProductos from "./tabs/AdminProductos";
import AdminUsuarios from "./tabs/AdminUsuarios";
import styles from "./Admin.module.css";

const Admin = () => {
  const { isAtLeast } = useAuth();
  const [tab, setTab] = useState("pedidos");

  const tabs = [
    { id: "pedidos",   label: "Pedidos",   show: true },
    { id: "productos", label: "Productos", show: true },
    { id: "usuarios",  label: "Usuarios",  show: isAtLeast("admin") },
  ].filter((t) => t.show);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="label">Panel de control</p>
          <h1 className={styles.title}>Administración</h1>
        </div>

        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {tab === "pedidos"   && <AdminPedidos />}
          {tab === "productos" && <AdminProductos />}
          {tab === "usuarios"  && isAtLeast("admin") && <AdminUsuarios />}
        </div>
      </div>
    </div>
  );
};

export default Admin;