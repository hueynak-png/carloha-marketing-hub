export default function MaterialButton({ link, status, label }) {
  const disabled = status === "Coming Soon" || !link || link === "Coming Soon";
  if (disabled) return <button className="materialButton disabled" disabled>{label} · Coming Soon</button>;
  return <a className="materialButton" href={link} target="_blank" rel="noreferrer">{label}</a>;
}
