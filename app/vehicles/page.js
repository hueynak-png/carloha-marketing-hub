import SearchBox from "../../components/SearchBox";
import VehicleCard from "../../components/VehicleCard";
import { getVehicleMaterials, groupByVehicle } from "../../lib/data";
import { siteCopy } from "../../lib/siteCopy";

export default async function VehiclesPage() {
  const materials = await getVehicleMaterials();
  const vehicles = groupByVehicle(materials);
  return <>
    <h1 className="pageTitle"><span className="en">{siteCopy.vehicles.title.EN}</span><span className="cn">{siteCopy.vehicles.title.CN}</span></h1>
    <p className="muted en">{siteCopy.vehicles.intro.EN}</p>
    <p className="muted cn">{siteCopy.vehicles.intro.CN}</p>
    <SearchBox items={materials} />
    <div className="grid">{vehicles.map(vehicle => <VehicleCard key={vehicle.vehicle} vehicle={vehicle} />)}</div>
  </>;
}
