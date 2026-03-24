import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./CtaBanner.module.css";

const CtaBanner = ({
  title = "Explorá el catálogo",
  text = "Productos cuidadosamente seleccionados para vos.",
  btnLabel = "Ver todo",
  to = "/productos",
}) => {
  const navigate = useNavigate();

  return (
    <section className={styles.cta}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>{text}</p>
        <button className={`btn btn-secondary ${styles.btn}`} onClick={() => navigate(to)}>
          {btnLabel}
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;