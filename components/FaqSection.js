import styles from "./FaqSection.module.css";

const faqs = [
  {
    question: "How do I download files?",
    questionCn: "如何下载文件？",
    answer: "Open the related Google Drive folder and download the files you need.",
    answerCn: "打开对应的 Google Drive 文件夹，下载你需要的资料。",
  },
  {
    question: "What if a link does not open?",
    questionCn: "如果链接打不开怎么办？",
    answer: "Submit the request form and choose “Report broken links”.",
    answerCn: "请提交需求表，并选择“失效链接反馈”。",
  },
  {
    question: "How often are materials updated?",
    questionCn: "资料多久更新一次？",
    answer: "Materials are expected to be reviewed monthly.",
    answerCn: "资料预计每月进行一次检查和更新。",
  },
  {
    question: "Can dealers use these materials for social media?",
    questionCn: "经销商可以将这些资料用于社交媒体吗？",
    answer: "Dealers may use approved materials for local marketing and social media promotion.",
    answerCn: "经销商可以将已批准的资料用于本地市场推广和社交媒体宣传。",
  },
];

export default function FaqSection() {
  return (
    <section className="support-section">
      <div className={styles.header}>
        <div>
          <h2>FAQ</h2>
          <p className="muted">
            <span className="en">Quick answers for common marketing hub questions.</span>
            <span className="cn">常见市场资料问题的快速解答。</span>
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {faqs.map((faq, index) => (
          <details className={styles.item} key={faq.question} open={index === 0}>
            <summary>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={`${styles.question} en`}>{faq.question}</span>
              <span className={`${styles.question} cn`}>{faq.questionCn}</span>
            </summary>
            <p className="en">{faq.answer}</p>
            <p className="cn">{faq.answerCn}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
