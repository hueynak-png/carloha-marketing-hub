import Link from "next/link";
import { getVehicleMaterials, latestVehicleUpdates, slugify } from "../../lib/data";

export default async function UpdatesPage() {
  const materials = await getVehicleMaterials();
  const updates = latestVehicleUpdates(materials, 20);
  return <>
    <h1 className="pageTitle">Latest Updates</h1>
    <p className="muted">Latest vehicle material updates based on the Last Updated field.</p>
    <div className="grid">{updates.map(v => <article className="card" key={v.vehicle}><div className="cardBody"><div className="eyebrow">{v.lastUpdated}</div><h3>{v.vehicle}</h3><p>{v.vehicle} materials updated — {v.lastUpdated}</p><Link className="primaryLink" href={`/vehicles/${slugify(v.vehicle)}`}>Open Vehicle Page</Link></div></article>)}</div>
  </>;
}
