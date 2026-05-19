import styles from "./FaqSection.module.css";
import { siteCopy } from "../lib/siteCopy";

export default function FaqSection() {
  return (
    <section className="support-section">
      <div className={styles.header}>
        <div>
          <h2>{siteCopy.faq.title}</h2>
          <p className="muted">
            <span className="en">{siteCopy.faq.intro.EN}</span>
            <span className="cn">{siteCopy.faq.intro.CN}</span>
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {siteCopy.faq.items.map((faq, index) => (
          <details className={styles.item} key={faq.EN.question} open={index === 0}>
            <summary>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={`${styles.question} en`}>{faq.EN.question}</span>
              <span className={`${styles.question} cn`}>{faq.CN.question}</span>
            </summary>
            <p className="en">{faq.EN.answer}</p>
            <p className="cn">{faq.CN.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
