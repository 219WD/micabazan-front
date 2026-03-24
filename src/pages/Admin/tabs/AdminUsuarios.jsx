import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import styles from "./AdminTabs.module.css";

const ROLES = ["usuario", "moderador", "admin", "dios"];

const AdminUsuarios = () => {
  const { user: me, isAtLeast } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cambiando, setCambiando] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/users");
        setUsuarios(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setCambiando(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsuarios((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar rol");
    } finally { setCambiando(null); }
  };

  const filtrados = usuarios.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.count}>{filtrados.length} usuarios</span>
      </div>

      <div className={styles.userList}>
        <div className={styles.userHeader}>
          <span>Usuario</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Desde</span>
        </div>
        {filtrados.map((u) => {
          const isSelf = u._id === me._id;
          const canChange = !isSelf && (
            isAtLeast("dios") ||
            (isAtLeast("admin") && u.role !== "admin" && u.role !== "dios")
          );

          return (
            <div key={u._id} className={styles.userRow}>
              <div className={styles.userName}>
                <span>{u.name}</span>
                {isSelf && <span className={styles.meTag}>Vos</span>}
              </div>
              <span className={styles.userEmail}>{u.email}</span>
              <div>
                {canChange ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    disabled={cambiando === u._id}
                    className={styles.roleSelect}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span className={styles.roleTag}>{u.role}</span>
                )}
              </div>
              <span className={styles.userDate}>
                {new Date(u.createdAt).toLocaleDateString("es-AR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsuarios;