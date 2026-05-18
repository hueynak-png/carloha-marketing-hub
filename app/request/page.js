import FaqSection from "../../components/FaqSection";
import RequestForm from "../../components/RequestForm";
import { CONTACT } from "../../lib/config";

export default function RequestPage() {
  return (
    <>
      <h1 className="pageTitle">
        <span className="en">Q&A / Request</span>
        <span className="cn">问题与需求</span>
      </h1>

      <p className="muted en">
        Use this page to request new materials, report broken links, ask product questions,
        or submit marketing execution questions.
      </p>

      <p className="muted cn">
        你可以在这里提交新资料需求、反馈失效链接、询问产品资料或市场执行问题。
      </p>

      <section className="support-section highlight">
        <h2>
          <span className="en">Marketing Support Request Form</span>
          <span className="cn">市场支持需求表</span>
        </h2>

        <p className="en">
          Please use this form to request new marketing materials, report broken links,
          ask product-related questions, or submit marketing execution questions.
          The marketing team will review your request and follow up if needed.
        </p>
        <p className="cn">
          请使用此表单提交新市场资料需求、反馈失效链接、询问产品相关问题或提交市场执行问题。
          市场团队会查看你的需求，并在需要时跟进。
        </p>

        <RequestForm />
      </section>

      <section className="support-section">
        <h2>
          <span className="en">Contact</span>
          <span className="cn">联系方式</span>
        </h2>

        <p>
          <strong>{CONTACT.name}</strong>
        </p>

        <div className="contact-list">
          <div className="contact-item">
            <strong><span className="en">Email:</span><span className="cn">邮箱：</span></strong>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>

          <div className="contact-item">
            <strong>WhatsApp:</strong>
            <span>{CONTACT.whatsapp}</span>
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
