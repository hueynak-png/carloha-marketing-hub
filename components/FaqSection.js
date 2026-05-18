import styles from "./FaqSection.module.css";

const faqs = [
  {
    question: "How do I download files?",
    answer: "Open the related Google Drive folder and download the files you need.",
  },
  {
    question: "What if a link does not open?",
    answer: "Submit the request form and choose “Report broken links”.",
  },
  {
    question: "How often are materials updated?",
    answer: "Materials are expected to be reviewed monthly.",
  },
  {
    question: "Can dealers use these materials for social media?",
    answer: "Dealers may use approved materials for local marketing and social media promotion.",
  },
];

export default function FaqSection() {
  return (
    <section className="support-section">
      <div className={styles.header}>
        <div>
          <h2>FAQ</h2>
          <p className="muted">Quick answers for common marketing hub questions.</p>
        </div>
      </div>

      <div className={styles.list}>
        {faqs.map((faq, index) => (
          <details className={styles.item} key={faq.question} open={index === 0}>
            <summary>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.question}>{faq.question}</span>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
