import FilterableVehicleMaterials from "../../components/FilterableVehicleMaterials";
import { getVehicleMaterials, groupByVehicle } from "../../lib/data";

export default async function VehiclesPage() {
  const materials = await getVehicleMaterials();
  const vehicles = groupByVehicle(materials);
  return <FilterableVehicleMaterials vehicles={vehicles} />;
}
