import Link from "next/link";
import { getVehicleMaterials, latestVehicleUpdates, slugify } from "../../lib/data";
import { siteCopy } from "../../lib/siteCopy";

export const metadata = {
  title: "Latest Updates — Recently Added Materials",
  description: "Recently updated vehicle materials and marketing resources for Carloha Nigeria. Check the latest brochures, photos, and training assets.",
};

export default async function UpdatesPage() {
  const materials = await getVehicleMaterials();
  const updates = latestVehicleUpdates(materials, 20);
  return <>
    <h1 className="pageTitle"><span className="en">{siteCopy.updates.title.EN}</span><span className="cn">{siteCopy.updates.title.CN}</span></h1>
    <p className="muted">
      <span className="en">{siteCopy.updates.intro.EN}</span>
      <span className="cn">{siteCopy.updates.intro.CN}</span>
    </p>
    <div className="grid">{updates.map(v => <article className="card" key={v.vehicle}><div className="cardBody"><div className="eyebrow">{v.lastUpdated}</div><h3>{v.vehicle}</h3><p><span className="en">{v.vehicle} materials updated — {v.lastUpdated}</span><span className="cn">{v.vehicle} 资料已更新 — {v.lastUpdated}</span></p><Link className="primaryLink" href={`/vehicles/${slugify(v.vehicle)}`}><span className="en">{siteCopy.updates.openVehiclePage.EN}</span><span className="cn">{siteCopy.updates.openVehiclePage.CN}</span></Link></div></article>)}</div>
  </>;
}
