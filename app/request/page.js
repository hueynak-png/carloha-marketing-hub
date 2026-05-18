import RequestForm from "../../components/RequestForm";
import { CONTACT } from "../../lib/config";

export default function RequestPage() {
  return (
    <>
      <h1 className="pageTitle">Q&A / Request</h1>

      <p className="muted en">
        Use this page to request new materials, report broken links, ask product questions,
        or submit marketing execution questions.
      </p>

      <p className="muted cn">
        你可以在这里提交新资料需求、反馈失效链接、询问产品资料或市场执行问题。
      </p>

      <section className="support-section highlight">
        <h2>Marketing Support Request Form</h2>

        <p>
          Please use this form to request new marketing materials, report broken links,
          ask product-related questions, or submit marketing execution questions.
          The marketing team will review your request and follow up if needed.
        </p>

        <RequestForm />
      </section>

      <section className="support-section">
        <h2>Contact</h2>

        <p>
          <strong>{CONTACT.name}</strong>
        </p>

        <div className="contact-list">
          <div className="contact-item">
            <strong>Email:</strong>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>

          <div className="contact-item">
            <strong>WhatsApp:</strong>
            <span>{CONTACT.whatsapp}</span>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="faqHeader">
          <div>
            <h2>FAQ</h2>
            <p className="muted">Quick answers for common marketing hub questions.</p>
          </div>
        </div>

        <div className="faq-list">
          <details className="faq-item" open>
            <summary>
              <span className="faqIndex">01</span>
              <span className="faq-question">How do I download files?</span>
            </summary>
            <p className="faq-answer">
              Open the related Google Drive folder and download the files you need.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faqIndex">02</span>
              <span className="faq-question">What if a link does not open?</span>
            </summary>
            <p className="faq-answer">
              Submit the request form and choose “Report broken links”.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faqIndex">03</span>
              <span className="faq-question">How often are materials updated?</span>
            </summary>
            <p className="faq-answer">
              Materials are expected to be reviewed monthly.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faqIndex">04</span>
              <span className="faq-question">Can dealers use these materials for social media?</span>
            </summary>
            <p className="faq-answer">
              Dealers may use approved materials for local marketing and social media promotion.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
