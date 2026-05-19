import FaqSection from "../../components/FaqSection";
import RequestForm from "../../components/RequestForm";
import { CONTACT } from "../../lib/config";
import { siteCopy } from "../../lib/siteCopy";

export default function RequestPage() {
  return (
    <>
      <h1 className="pageTitle">
        <span className="en">{siteCopy.requestPage.title.EN}</span>
        <span className="cn">{siteCopy.requestPage.title.CN}</span>
      </h1>

      <p className="muted en">{siteCopy.requestPage.intro.EN}</p>

      <p className="muted cn">{siteCopy.requestPage.intro.CN}</p>

      <section className="support-section highlight">
        <h2>
          <span className="en">{siteCopy.requestPage.formTitle.EN}</span>
          <span className="cn">{siteCopy.requestPage.formTitle.CN}</span>
        </h2>

        <p className="en">{siteCopy.requestPage.formIntro.EN}</p>
        <p className="cn">{siteCopy.requestPage.formIntro.CN}</p>

        <RequestForm />
      </section>

      <section className="support-section">
        <h2>
          <span className="en">{siteCopy.requestPage.contactTitle.EN}</span>
          <span className="cn">{siteCopy.requestPage.contactTitle.CN}</span>
        </h2>

        <p>
          <strong>{CONTACT.name}</strong>
        </p>

        <div className="contact-list">
          <div className="contact-item">
            <strong><span className="en">{siteCopy.requestPage.email.EN}</span><span className="cn">{siteCopy.requestPage.email.CN}</span></strong>
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
