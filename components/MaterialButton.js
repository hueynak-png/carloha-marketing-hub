export default function MaterialButton({ link, status, label, cnLabel }) {
  const disabled = status === "Coming Soon" || !link || link === "Coming Soon";
  const content = (
    <>
      <span className="en">{label}</span>
      <span className="cn">{cnLabel || label}</span>
    </>
  );
  if (disabled) {
    return (
      <button className="materialButton disabled" disabled>
        {content}
        <span className="en"> · Coming Soon</span>
        <span className="cn"> · 即将上线</span>
      </button>
    );
  }
  return <a className="materialButton" href={link} target="_blank" rel="noreferrer">{content}</a>;
}
