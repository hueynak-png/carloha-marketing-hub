import Link from "next/link";
import SearchBox from "../components/SearchBox";
import VehicleCard from "../components/VehicleCard";
import { getVehicleMaterials, getGeneralMaterials, groupByVehicle, latestVehicleUpdates } from "../lib/data";

export default async function Home() {
  const vehicleMaterials = await getVehicleMaterials();
  const generalMaterials = await getGeneralMaterials();
  const vehicles = groupByVehicle(vehicleMaterials);
  const updates = latestVehicleUpdates(vehicleMaterials, 4);
  return (
    <>
      <section className="hero">
        <div>
          <h1>Carloha Marketing Hub</h1>
          <p className="en">One place for vehicle materials, brand assets, and dealer marketing support.</p>
          <p className="cn">统一管理车型资料、品牌素材和经销商市场支持内容。</p>
          <Link className="primaryLink" href="/vehicles">
            <span className="en">Browse Vehicle Materials</span>
            <span className="cn">浏览车型资料</span>
          </Link>
        </div>
        <div className="heroVisual">
  <img
    src="/banner/multi-vehicle-banner.webp.png"
    alt="Carloha multi-vehicle banner"
    className="heroBannerImage"
  />
</div>
      </section>
      <SearchBox items={[...vehicleMaterials, ...generalMaterials]} />
      <div className="sectionHeader">
  <h2><span className="en">Latest Updates</span><span className="cn">最新更新</span></h2>
  <Link className="back-btn small-btn" href="/updates">
    <span className="en">View all</span><span className="cn">查看全部</span>
  </Link>
</div>
      <div className="grid">{updates.map(v => <div className="card" key={v.vehicle}><div className="cardBody"><div className="eyebrow"><span className="en">Updated</span><span className="cn">已更新</span></div><h3>{v.vehicle}</h3><p><span className="en">{v.vehicle} materials updated — {v.lastUpdated}</span><span className="cn">{v.vehicle} 资料已更新 — {v.lastUpdated}</span></p><Link className="primaryLink" href={`/vehicles/${v.vehicle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`}><span className="en">Open</span><span className="cn">打开</span></Link></div></div>)}</div>
      <div className="sectionHeader">
  <h2><span className="en">Vehicle Materials</span><span className="cn">车型资料</span></h2>
  <Link className="back-btn small-btn" href="/vehicles">
    <span className="en">View all</span><span className="cn">查看全部</span>
  </Link>
</div>
      <div className="grid">{vehicles.slice(0, 4).map(vehicle => <VehicleCard key={vehicle.vehicle} vehicle={vehicle} />)}</div>
      <p className="footerNote">
        <span className="en">© Carloha. For internal sales and dealer marketing support only. Materials are for authorized Carloha sales and dealer use only. Please confirm product information before external communication.</span>
        <span className="cn">© Carloha。仅供内部销售和经销商市场支持使用。资料仅限授权 Carloha 销售团队和经销商使用，对外沟通前请确认产品信息。</span>
      </p>
    </>
  );
}
