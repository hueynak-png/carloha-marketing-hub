import Link from "next/link";
import SearchBox from "../components/SearchBox";
import VehicleCard from "../components/VehicleCard";
import { getVehicleMaterials, getGeneralMaterials, groupByVehicle, latestVehicleUpdates } from "../lib/data";

export default async function Home() {
  const vehicleMaterials = await getVehicleMaterials();
  const generalMaterials = await getGeneralMaterials();
  const vehicles = groupByVehicle(vehicleMaterials);
  const updates = latestVehicleUpdates(vehicleMaterials, 5);
  return (
    <>
      <section className="hero">
        <div>
          <h1>Carloha Marketing Hub</h1>
          <p className="en">One place for vehicle materials, brand assets, and dealer marketing support.</p>
          <p className="cn">统一管理车型资料、品牌素材和经销商市场支持内容。</p>
          <Link className="primaryLink" href="/vehicles">Browse Vehicle Materials</Link>
        </div>
        <div className="heroVisual">Multi-vehicle banner placeholder</div>
      </section>
      <SearchBox items={[...vehicleMaterials, ...generalMaterials]} />
      <div className="sectionHeader"><h2>Latest Updates</h2><Link href="/updates">View all</Link></div>
      <div className="grid">{updates.map(v => <div className="card" key={v.vehicle}><div className="cardBody"><div className="eyebrow">Updated</div><h3>{v.vehicle}</h3><p>{v.vehicle} materials updated — {v.lastUpdated}</p><Link className="primaryLink" href={`/vehicles/${v.vehicle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`}>Open</Link></div></div>)}</div>
      <div className="sectionHeader"><h2>Vehicle Materials</h2><Link href="/vehicles">View all</Link></div>
      <div className="grid">{vehicles.slice(0, 4).map(vehicle => <VehicleCard key={vehicle.vehicle} vehicle={vehicle} />)}</div>
      <p className="footerNote">© Carloha. For internal sales and dealer marketing support only. Materials are for authorized Carloha sales and dealer use only. Please confirm product information before external communication.</p>
    </>
  );
}
