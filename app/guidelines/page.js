import { siteCopy } from "../../lib/siteCopy";

export default function GuidelinesPage() {
  return (
    <>
      <h1 className="pageTitle">
        <span className="en">{siteCopy.guidelines.title.EN}</span>
        <span className="cn">{siteCopy.guidelines.title.CN}</span>
      </h1>
      <p className="muted en">{siteCopy.guidelines.intro.EN}</p>
      <p className="muted cn">{siteCopy.guidelines.intro.CN}</p>

      <section className="support-section highlight guidelines-section">
        <h2><span className="en">{siteCopy.guidelines.rulesTitle.EN}</span><span className="cn">{siteCopy.guidelines.rulesTitle.CN}</span></h2>

        <ul className="guidelines-list en">
          {siteCopy.guidelines.rules.EN.map(item => (
            <li key={item.lead}>
              <strong>{item.lead}</strong>{item.tail}
            </li>
          ))}
        </ul>
        <ul className="guidelines-list cn">
          {siteCopy.guidelines.rules.CN.map(item => (
            <li key={item.lead}>
              <strong>{item.lead}</strong>{item.tail}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
