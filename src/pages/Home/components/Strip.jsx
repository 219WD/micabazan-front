import styles from "./Strip.module.css";

const ITEMS = [
  "Envíos a todo el país",
  "Pago seguro",
  "Atención personalizada",
  "Transferencia o MercadoPago",
];

const Strip = () => (
  <section className={styles.strip}>
    {ITEMS.map((item, i) => (
      <div key={item} className={styles.group}>
        <span className={styles.label}>{item}</span>
        {i < ITEMS.length - 1 && <span className={styles.dot} />}
      </div>
    ))}
  </section>
);

export default Strip;