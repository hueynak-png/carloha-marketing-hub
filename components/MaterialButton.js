"use client";

import Link from "next/link";

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

function buildRequestUrl(requestMeta = {}) {
  const params = new URLSearchParams();
  params.set("requestType", "New material request");

  if (requestMeta.vehicle) params.set("vehicle", requestMeta.vehicle);
  if (requestMeta.materialType) params.set("materialType", requestMeta.materialType);
  if (!requestMeta.materialType && requestMeta.category) params.set("materialType", requestMeta.category);

  const target = [
    requestMeta.vehicle,
    requestMeta.materialType || requestMeta.category || requestMeta.title,
  ].filter(Boolean).join(" ");

  params.set("message", target ? `Please notify me when ${target} is available.` : "Please notify me when this material is available.");
  return `/request?${params.toString()}`;
}

export default function MaterialButton({ link, status, label, cnLabel, analyticsMeta = null, requestMeta = null }) {
  const disabled = status === "Coming Soon" || !link || link === "Coming Soon";
  if (disabled) {
    return (
      <Link className="materialButton pendingRequestButton" href={buildRequestUrl(requestMeta || analyticsMeta)}>
        <span className="en">Coming Soon</span>
        <span className="cn">即将上线</span>
      </Link>
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
      <span className="en">{label}</span>
      <span className="cn">{cnLabel || label}</span>
    </a>
  );
}
