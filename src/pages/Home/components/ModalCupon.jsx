import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./ModalCupon.module.css";

/**
 * ModalCupon - Modal de descuento que aparece al entrar
 * 
 * Props:
 * - onClose: Función callback cuando se cierra el modal
 * - discount: Porcentaje de descuento (default 15)
 * - onSubmit: Función callback cuando se envía el email
 * - delayMs: Milisegundos antes de mostrar el modal (default 2000)
 */
const ModalCupon = ({ 
  onClose, 
  discount = 15,
  onSubmit,
  delayMs = 2000,
  image = "https://micaelabazan.com/wp-content/uploads/2025/08/dsc_8182-scaled.jpeg"
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mostrar el modal con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // El modal ya está visible por defecto
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      alert("Por favor ingresa tu email");
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar callback si existe
      if (onSubmit) {
        await onSubmit(email);
      }
      
      setSubmitted(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (error) {
      alert("Error al enviar. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Modal con contenido */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Botón cerrar */}
        <button 
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Contenido dividido en 2 columnas */}
        <div className={styles.content}>
          
          {/* Lado izquierdo: Formulario */}
          <div className={styles.left}>
            {submitted ? (
              <div className={styles.successMessage}>
                <h2>¡Gracias!</h2>
                <p>Te enviamos tu código de descuento al email.</p>
              </div>
            ) : (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>
                    {discount}% en tu <br />
                    primera compra
                  </h1>
                  <p className={styles.subtitle}>
                    Suscribite y descubrí nuevas colecciones, drops exclusivos y prendas diseñadas para acompañarte todos los días.
                  </p>
                </div>

                {/* Formulario */}
                <form className={styles.form} onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  />
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "ENVIANDO..." : "CONTINUAR"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Lado derecho: Imagen */}
          <div className={styles.right}>
            <img 
              src={image} 
              alt="Modelo" 
              className={styles.image}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500x600?text=.";
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalCupon;