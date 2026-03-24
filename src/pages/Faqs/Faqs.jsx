import { useState } from "react";
import styles from "./Faqs.module.css";

const Faqs = () => {
  const [openSections, setOpenSections] = useState({
    generales: true,
    otras: false
  });
  
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqData = {
    generales: {
      title: "Preguntas Generales",
      questions: [
        {
          id: "cancelar-pedido",
          question: "¿CÓMO CANCELAR MI PEDIDO?",
          answer: "Una vez que recibiste la confirmación de tu compra, tenés un máximo de 12 hs para cancelar el envío de tu pedido. Para esto debes escribir un mail a info@micaelabazan.com con el número de tu orden."
        },
        {
          id: "numero-orden",
          question: "¿CÓMO CONOZCO EL NÚMERO DE ORDEN DE MI PEDIDO?",
          answer: "Para conocer el ID único que posee la orden de tu compra podés acceder a tu email y revisar el que te llegó al momento de la compra. Está conformado por un numeral (#) y cuatro números."
        },
        {
          id: "precios",
          question: "PRECIOS",
          answer: "Argentina: Todos los precios se encuentran expresados en pesos argentinos (AR$)"
        },
        {
          id: "stock",
          question: "¿CÓMO SÉ SI UN PRODUCTO SE ENCUENTRA EN STOCK?",
          answer: "Todos los productos visibles en la tienda virtual poseen existencias. Si ves algún modelo de bikini en otras plataformas como redes sociales o emails promocionales y no podés encontrarlos en nuestra tienda virtual es porque esa prenda ya no posee stock."
        },
        {
          id: "envio-responsabilidad",
          question: "ENVÍO Y ENTREGA DE PRODUCTO",
          answer: "Micaela Bazan Ind no será responsable por los errores causados en la entrega cuando la dirección de envío introducida por el usuario en el formulario de pedido no se ajuste a la realidad o haya sido omitida o errónea. Por cualquier error o cambio de dirección de envío habrán unos nuevos gastos de envío que correrán a cargo del cliente."
        },
        {
          id: "defectuoso",
          question: "¿QUÉ DEBO HACER SI ME LLEGA UN ARTÍCULO DEFECTUOSO?",
          answer: "Micaela Bazán Ind sólo vende artículos en perfecto estado, por lo que si, excepcionalmente te llega una prenda con alguna falla deberás contactarte con info@micaelabazan.com. Debes tener en cuenta que todos los artículos de Micaela Bazán tienen un gran nivel de detalle, por lo que la producción es única y pueden variar levemente en las costuras o estampas en relación a las imágenes mostradas en el Sitio Web."
        }
      ]
    },
    otras: {
      title: "Otras preguntas",
      questions: [
        {
          id: "articulo-incorrecto",
          question: "¿QUÉ DEBO HACER SI ME LLEGA UN ARTÍCULO INCORRECTO?",
          answer: "Si en alguna ocasión, por error, te llega un artículo que no has pedido contactanos a info@micaelabazan.com"
        },
        {
          id: "costo-envio",
          question: "¿CUÁL ES EL COSTO Y TIEMPO DE ENVÍO?",
          answer: "El tiempo de envío es de un máximo de 20 días hábiles. El costo del envío está determinado por el proveedor logístico, el valor del mismo varía dependiendo del destino y el tipo de envío."
        },
        {
          id: "no-estoy",
          question: "¿QUÉ PASA SI LLEGA EL PEDIDO Y NO ESTOY?",
          answer: "Si elegiste el método de envío a domicilio y el agente del correo privado no te encuentra en tu domicilio, te deja un aviso de visita. Para conocer el estado de tu envío con tu número de guía podés ingresar en el link que te llegará por email y realizar el seguimiento de tu pedido."
        },
        {
          id: "inconvenientes-envio",
          question: "¿INCONVENIENTES CON EL ENVÍO?",
          answer: "En caso de tener algún tipo de inconveniente con el envío, por favor envía un email con tu consulta a info@micaelabazan.com"
        },
        {
          id: "devoluciones",
          question: "DEVOLUCIONES",
          answer: "Podés realizar la devolución por la página, mandanos un mail a info@micaelabazan.com con fotografías completas del producto y sus respectivas etiquetas. Indicános número de pedido, qué modelo querés devolver y por qué."
        },
        {
          id: "tiempos-despacho",
          question: "TIEMPOS DE DESPACHO",
          answer: "Los despachos se realizarán dentro de los 7 a 20 días posteriores a la compra."
        }
      ]
    }
  };

  return (
    <div className={styles.faqs}>
      <div className="container">
        <div className={styles.header}>
          <h1>Preguntas Frecuentes</h1>
          <div className={styles.divider}></div>
        </div>

        {Object.entries(faqData).map(([sectionKey, section]) => (
          <div key={sectionKey} className={styles.section}>
            <button
              className={styles.sectionButton}
              onClick={() => toggleSection(sectionKey)}
              aria-expanded={openSections[sectionKey]}
            >
              <span className={styles.sectionTitle}>{section.title}</span>
              <span className={`${styles.icon} ${openSections[sectionKey] ? styles.iconOpen : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            
            {openSections[sectionKey] && (
              <div className={styles.questionsList}>
                {section.questions.map((item) => (
                  <div key={item.id} className={styles.questionItem}>
                    <button
                      className={styles.questionButton}
                      onClick={() => toggleQuestion(item.id)}
                      aria-expanded={openQuestions[item.id]}
                    >
                      <span className={styles.questionText}>{item.question}</span>
                      <span className={`${styles.questionIcon} ${openQuestions[item.id] ? styles.questionIconOpen : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                    </button>
                    
                    {openQuestions[item.id] && (
                      <div className={styles.answer}>
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;