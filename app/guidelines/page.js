import { siteCopy } from "../../lib/siteCopy";
import Link from "next/link";

export const metadata = {
  title: "Usage Guidelines — Marketing Materials",
  description: "Usage rules and guidelines for Carloha marketing materials. Learn how to properly use vehicle images, brand assets, and dealer resources.",
};

function GuidelineCards({ language }) {
  return (
    <div className={`guidelinesGrid ${language === "EN" ? "en" : "cn"}`}>
      {siteCopy.guidelines.rules[language].map((item, index) => (
        <article className="guidelineCard" key={item.title}>
          <div className="guidelineCardTop">
            <span className="guidelineNumber">{String(index + 1).padStart(2, "0")}</span>
            <span className="guidelineLabel">{item.label}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <>
      <section className="guidelinesHero">
        <div>
          <h1 className="pageTitle">
            <span className="en">{siteCopy.guidelines.title.EN}</span>
            <span className="cn">{siteCopy.guidelines.title.CN}</span>
          </h1>
          <p className="muted en">{siteCopy.guidelines.intro.EN}</p>
          <p className="muted cn">{siteCopy.guidelines.intro.CN}</p>
        </div>

      </section>

      <section className="support-section highlight guidelines-section">
        <div className="guidelinesSectionHeader">
          <h2><span className="en">{siteCopy.guidelines.rulesTitle.EN}</span><span className="cn">{siteCopy.guidelines.rulesTitle.CN}</span></h2>
        </div>

        <GuidelineCards language="EN" />
        <GuidelineCards language="CN" />
      </section>

      <section className="guidelinesRequestCallout">
        <div>
          <h2><span className="en">{siteCopy.guidelines.noteTitle.EN}</span><span className="cn">{siteCopy.guidelines.noteTitle.CN}</span></h2>
          <p className="en">{siteCopy.guidelines.noteBody.EN}</p>
          <p className="cn">{siteCopy.guidelines.noteBody.CN}</p>
        </div>
        <Link className="primaryLink" href="/request">
          <span className="en">{siteCopy.guidelines.noteAction.EN}</span>
          <span className="cn">{siteCopy.guidelines.noteAction.CN}</span>
        </Link>
      </section>
    </>
  );
}
