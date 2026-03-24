import { useNavigate } from "react-router-dom";
const PagoAprobado = () => {
  const navigate = useNavigate();
  return (
    <div className="page"><div className="container" style={{textAlign:"center",paddingTop:"4rem"}}>
      <h1 style={{color:"var(--color-success)",fontSize:"3rem"}}>✓</h1>
      <h2>¡Pago aprobado!</h2>
      <p style={{color:"var(--color-text-secondary)",margin:"1rem 0"}}>Tu pedido fue procesado exitosamente.</p>
      <button onClick={() => navigate("/mis-pedidos")} style={{padding:"0.75rem 2rem",background:"var(--color-primary)",color:"white",borderRadius:"0.5rem",fontWeight:600,marginTop:"1rem"}}>
        Ver mis pedidos
      </button>
    </div></div>
  );
};
export default PagoAprobado;