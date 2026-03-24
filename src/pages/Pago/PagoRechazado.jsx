import { useNavigate } from "react-router-dom";
const PagoRechazado = () => {
  const navigate = useNavigate();
  return (
    <div className="page"><div className="container" style={{textAlign:"center",paddingTop:"4rem"}}>
      <h1 style={{color:"var(--color-error)",fontSize:"3rem"}}>✕</h1>
      <h2>Pago rechazado</h2>
      <p style={{color:"var(--color-text-secondary)",margin:"1rem 0"}}>Hubo un problema con tu pago. Podés intentarlo nuevamente.</p>
      <button onClick={() => navigate("/carrito")} style={{padding:"0.75rem 2rem",background:"var(--color-primary)",color:"white",borderRadius:"0.5rem",fontWeight:600,marginTop:"1rem"}}>
        Volver al carrito
      </button>
    </div></div>
  );
};
export default PagoRechazado;