import FilterableGeneralMaterials from "../../components/FilterableGeneralMaterials";
import { getGeneralMaterials } from "../../lib/data";

export const metadata = {
  title: "General Materials — Brand Assets & Campaign Resources",
  description: "Browse general marketing materials including brand assets, showroom files, campaign resources, and dealer guidelines for Carloha Nigeria.",
};

export default async function GeneralPage() {
  const materials = await getGeneralMaterials();
  return <FilterableGeneralMaterials materials={materials} />;
}
