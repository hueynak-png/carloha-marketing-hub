import SearchBox from "../../components/SearchBox";
import VehicleCard from "../../components/VehicleCard";
import { getVehicleMaterials, groupByVehicle } from "../../lib/data";

export default async function VehiclesPage() {
  const materials = await getVehicleMaterials();
  const vehicles = groupByVehicle(materials);
  return <>
    <h1 className="pageTitle">Vehicle Materials</h1>
    <p className="muted en">Browse materials by vehicle. Each vehicle page includes specification sheets, brochures, photos, videos, social media videos, and training materials.</p>
    <p className="muted cn">按车型查找资料。每个车型页面包含配置表、手册、图片、视频、社媒视频和培训资料。</p>
    <SearchBox items={materials} />
    <div className="grid">{vehicles.map(vehicle => <VehicleCard key={vehicle.vehicle} vehicle={vehicle} />)}</div>
  </>;
}
