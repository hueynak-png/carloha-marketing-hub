import Link from "next/link";
import { getVehicleMaterials, latestVehicleUpdates, slugify } from "../../lib/data";

export default async function UpdatesPage() {
  const materials = await getVehicleMaterials();
  const updates = latestVehicleUpdates(materials, 20);
  return <>
    <h1 className="pageTitle"><span className="en">Latest Updates</span><span className="cn">最新更新</span></h1>
    <p className="muted">
      <span className="en">Latest vehicle material updates based on the Last Updated field.</span>
      <span className="cn">根据“最后更新”字段展示最新车型资料更新。</span>
    </p>
    <div className="grid">{updates.map(v => <article className="card" key={v.vehicle}><div className="cardBody"><div className="eyebrow">{v.lastUpdated}</div><h3>{v.vehicle}</h3><p><span className="en">{v.vehicle} materials updated — {v.lastUpdated}</span><span className="cn">{v.vehicle} 资料已更新 — {v.lastUpdated}</span></p><Link className="primaryLink" href={`/vehicles/${slugify(v.vehicle)}`}><span className="en">Open Vehicle Page</span><span className="cn">打开车型页面</span></Link></div></article>)}</div>
  </>;
}
