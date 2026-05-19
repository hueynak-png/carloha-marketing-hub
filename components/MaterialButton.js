"use client";

function trackMaterialOpen(meta) {
  const payload = JSON.stringify({
    type: "material_open",
    ...meta,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export default function MaterialButton({ link, status, label, cnLabel, analyticsMeta = null }) {
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
  return (
    <a
      className="materialButton"
      href={link}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        if (analyticsMeta) trackMaterialOpen(analyticsMeta);
      }}
    >
      {content}
    </a>
  );
}
