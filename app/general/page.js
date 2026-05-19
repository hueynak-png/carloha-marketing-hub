import MaterialButton from "../../components/MaterialButton";
import SearchBox from "../../components/SearchBox";
import { getGeneralMaterials } from "../../lib/data";
import { siteCopy } from "../../lib/siteCopy";
import { generalDescriptions, translateValue } from "../../lib/translations";

export default async function GeneralPage() {
  const materials = await getGeneralMaterials();
  return <>
    <h1 className="pageTitle"><span className="en">{siteCopy.general.title.EN}</span><span className="cn">{siteCopy.general.title.CN}</span></h1>
    <p className="muted en">{siteCopy.general.intro.EN}</p>
    <p className="muted cn">{siteCopy.general.intro.CN}</p>
    <SearchBox items={materials} />
    <div className="grid">
      {materials.map(item => <article className="card" key={item.Category}><div className="cardBody"><div className="eyebrow"><span className="en">{item.Status}</span><span className="cn">{translateValue(item.Status)}</span></div><h3><span className="en">{item.Category}</span><span className="cn">{translateValue(item.Category)}</span></h3><p><span className="en">{item.Description}</span><span className="cn">{generalDescriptions[item.Category] || item.Description}</span></p><MaterialButton link={item["Google Drive Link"]} status={item.Status} label={siteCopy.general.openFolder.EN} cnLabel={siteCopy.general.openFolder.CN} /></div></article>)}
    </div>
  </>;
}
