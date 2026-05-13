import { CONTACT, REQUEST_FORM_URL } from "../../lib/config";

export default function RequestPage() {
  return <>
    <h1 className="pageTitle">Q&A / Request</h1>
    <p className="muted en">Use this page to request new materials, report broken links, ask product questions, or submit marketing execution questions.</p>
    <p className="muted cn">你可以在这里提交新资料需求、反馈失效链接、询问产品资料或市场执行问题。</p>
    <section className="infoBox">
      <h2>Marketing Support Request Form</h2>
      <p>Please use this form to request new marketing materials, report broken links, ask product-related questions, or submit marketing execution questions. The marketing team will review your request and follow up if needed.</p>
      <a className="primaryLink" href={REQUEST_FORM_URL} target="_blank" rel="noreferrer">Open Request Form</a>
    </section>
    <section className="infoBox" style={{marginTop:16}}>
      <h2>Contact</h2>
      <p><strong>{CONTACT.name}</strong></p>
      <p>Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
      <p>WhatsApp: {CONTACT.whatsapp}</p>
    </section>
    <section className="infoBox" style={{marginTop:16}}>
      <h2>FAQ</h2>
      <h3>How do I download files?</h3><p>Open the related Google Drive folder and download the files you need.</p>
      <h3>What if a link does not open?</h3><p>Submit the request form and choose “Report broken links”.</p>
      <h3>How often are materials updated?</h3><p>Materials are expected to be reviewed monthly.</p>
      <h3>Can dealers use these materials for social media?</h3><p>Dealers may use approved materials for local marketing and social media promotion.</p>
    </section>
  </>;
}
