"use client";

import Link from "next/link";
import { slugify } from "../lib/data";
import { translateValue } from "../lib/translations";
import useLanguage from "./useLanguage";

export default function VehicleCard({ vehicle }) {
  const language = useLanguage();
  const status = language === "CN" ? translateValue(vehicle.status) : vehicle.status;
  const lastUpdated = vehicle.lastUpdated || (language === "CN" ? "即将上线" : "Coming Soon");

  return (
    <article className="card vehicleCard">
      <div className="vehicleImage">
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.vehicle} />
        ) : (
          <div className="imagePlaceholder">
            <span className="en">Vehicle Image</span>
            <span className="cn">车型图片</span>
          </div>
        )}
      </div>
      <div className="cardBody">
        <div className="eyebrow">{status}</div>
        <h3>{vehicle.vehicle}</h3>
        <p>
          <span className="en">Official marketing materials for {vehicle.vehicle}.</span>
          <span className="cn">{vehicle.vehicle} 官方市场资料。</span>
        </p>
        <p className="muted">
          <span className="en">Last Updated: {lastUpdated}</span>
          <span className="cn">最后更新：{lastUpdated}</span>
        </p>
        <Link className="primaryLink" href={`/vehicles/${slugify(vehicle.vehicle)}`}>
          <span className="en">Open Vehicle Page</span>
          <span className="cn">打开车型页面</span>
        </Link>
      </div>
    </article>
  );
}
