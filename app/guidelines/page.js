export default function GuidelinesPage() {
  return (
    <>
      <h1 className="pageTitle">Usage Guidelines</h1>
      <p className="muted">
        Please follow the guidelines below when using vehicle materials, brand assets,
        and dealer marketing content.
      </p>

      <section className="support-section highlight guidelines-section">
        <h2>General Rules</h2>

        <ul className="guidelines-list">
          <li>
            <strong>Always use the latest version</strong> shown on this website.
          </li>
          <li>
            <strong>Do not modify logos, brand visuals, or official product information</strong>
            {" "}without approval.
          </li>
          <li>
            <strong>Confirm product specifications and prices</strong> before external sharing.
          </li>
          <li>
            <strong>Dealers may use approved materials</strong> for local marketing and social media promotion.
          </li>
        </ul>
      </section>
    </>
  );
}
