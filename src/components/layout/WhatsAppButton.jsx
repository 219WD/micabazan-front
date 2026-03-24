import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import styles from "./WhatsAppButton.module.css";

/**
 * WhatsAppButton - Botón flotante de WhatsApp
 * Aparece fijo en la esquina inferior derecha de toda la página
 * 
 * Props:
 * - phoneNumber: número de teléfono (ej: "5491234567890")
 * - message: mensaje predefinido (opcional)
 */
const WhatsAppButton = ({ 
  phoneNumber = "5491234567890",
  message = "Hola! 👋 ¿En qué puedo ayudarte?"
}) => {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      className={styles.whatsappButton}
      onClick={handleWhatsAppClick}
      title="Chatear por WhatsApp"
      aria-label="Abrir WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} className={styles.icon} />
    </button>
  );
};

export default WhatsAppButton;