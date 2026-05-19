import FilterableGeneralMaterials from "../../components/FilterableGeneralMaterials";
import { getGeneralMaterials } from "../../lib/data";

export default async function GeneralPage() {
  const materials = await getGeneralMaterials();
  return <FilterableGeneralMaterials materials={materials} />;
}
