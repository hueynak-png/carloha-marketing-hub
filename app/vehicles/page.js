import FilterableVehicleMaterials from "../../components/FilterableVehicleMaterials";
import { getVehicleMaterials, groupByVehicle } from "../../lib/data";

export const metadata = {
  title: "Vehicle Materials — Chery Tiggo & More",
  description: "Browse official marketing materials by vehicle model. Brochures, photos, videos, and training assets for Chery Tiggo SUVs in Nigeria.",
};

export default async function VehiclesPage() {
  const materials = await getVehicleMaterials();
  const vehicles = groupByVehicle(materials);
  return <FilterableVehicleMaterials vehicles={vehicles} />;
}
