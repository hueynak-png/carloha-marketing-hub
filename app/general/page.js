import MaterialButton from "../../components/MaterialButton";
import SearchBox from "../../components/SearchBox";
import { getGeneralMaterials } from "../../lib/data";

export default async function GeneralPage() {
  const materials = await getGeneralMaterials();
  return <>
    <h1 className="pageTitle">General Materials</h1>
    <p className="muted en">Access brand assets, event materials, showroom materials, holiday campaigns, PR articles, and dealer guidelines.</p>
    <p className="muted cn">访问品牌资产、活动物料、展厅物料、节日活动、PR文章和经销商指南。</p>
    <SearchBox items={materials} />
    <div className="grid">
      {materials.map(item => <article className="card" key={item.Category}><div className="cardBody"><div className="eyebrow">{item.Status}</div><h3>{item.Category}</h3><p>{item.Description}</p><MaterialButton link={item["Google Drive Link"]} status={item.Status} label="Open Folder" /></div></article>)}
    </div>
  </>;
}
