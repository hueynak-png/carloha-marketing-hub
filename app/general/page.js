import MaterialButton from "../../components/MaterialButton";
import SearchBox from "../../components/SearchBox";
import { getGeneralMaterials } from "../../lib/data";
import { generalDescriptions, translateValue } from "../../lib/translations";

export default async function GeneralPage() {
  const materials = await getGeneralMaterials();
  return <>
    <h1 className="pageTitle"><span className="en">General Materials</span><span className="cn">通用资料</span></h1>
    <p className="muted en">Access brand assets, event materials, showroom materials, holiday campaigns, PR articles, and dealer guidelines.</p>
    <p className="muted cn">访问品牌资产、活动物料、展厅物料、节日活动、PR文章和经销商指南。</p>
    <SearchBox items={materials} />
    <div className="grid">
      {materials.map(item => <article className="card" key={item.Category}><div className="cardBody"><div className="eyebrow"><span className="en">{item.Status}</span><span className="cn">{translateValue(item.Status)}</span></div><h3><span className="en">{item.Category}</span><span className="cn">{translateValue(item.Category)}</span></h3><p><span className="en">{item.Description}</span><span className="cn">{generalDescriptions[item.Category] || item.Description}</span></p><MaterialButton link={item["Google Drive Link"]} status={item.Status} label="Open Folder" cnLabel="打开文件夹" /></div></article>)}
    </div>
  </>;
}
