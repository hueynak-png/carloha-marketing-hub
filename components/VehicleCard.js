import Link from "next/link";
import { slugify } from "../lib/data";

export default function VehicleCard({ vehicle }) {
  return (
    <article className="card vehicleCard">
      <div className="vehicleImage">
        {vehicle.image ? <img src={vehicle.image} alt={vehicle.vehicle} /> : <div className="imagePlaceholder">Vehicle Image</div>}
      </div>
      <div className="cardBody">
        <div className="eyebrow">{vehicle.status}</div>
        <h3>{vehicle.vehicle}</h3>
        <p>Official marketing materials for {vehicle.vehicle}.</p>
        <p className="muted">Last Updated: {vehicle.lastUpdated || "Coming Soon"}</p>
        <Link className="primaryLink" href={`/vehicles/${slugify(vehicle.vehicle)}`}>Open Vehicle Page</Link>
      </div>
    </article>
  );
}
