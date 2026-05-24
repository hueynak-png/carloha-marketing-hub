import Link from "next/link";
import SearchBox from "../components/SearchBox";
import OptimizedImage from "../components/OptimizedImage";
import { getVehicleMaterials, getGeneralMaterials, getMaterialStats, latestVehicleUpdates } from "../lib/data.js";
import { siteCopy } from "../lib/siteCopy";

export default async function Home() {
  const vehicleMaterials = await getVehicleMaterials();
  const generalMaterials = await getGeneralMaterials();
  const updates = latestVehicleUpdates(vehicleMaterials, 4);
  const stats = getMaterialStats(vehicleMaterials, generalMaterials);
  return (
    <>
      <section className="hero">
        <div>
          <h1>Carloha Marketing Hub</h1>
          <p className="en">{siteCopy.home.heroBody.EN}</p>
          <p className="cn">{siteCopy.home.heroBody.CN}</p>
          <Link className="primaryLink" href="/vehicles">
            <span className="en">{siteCopy.home.browseVehicles.EN}</span>
            <span className="cn">{siteCopy.home.browseVehicles.CN}</span>
          </Link>
        </div>
        <div className="heroVisual">
          <OptimizedImage
            src="/banner/multi-vehicle-banner.png"
            alt="Carloha multi-vehicle banner"
            className="heroBannerImage"
            sizes="(max-width: 860px) 100vw, 42vw"
            priority
          />
        </div>
      </section>
      <SearchBox items={[...vehicleMaterials, ...generalMaterials]} />
      <div className="sectionHeader">
        <h2><span className="en">{siteCopy.home.overviewTitle.EN}</span><span className="cn">{siteCopy.home.overviewTitle.CN}</span></h2>
      </div>
      <div className="statsGrid">
        <article className="statCard">
          <span className="statValue">{stats.readyVehicleCount}</span>
          <span className="en">{siteCopy.home.readyVehicles.EN}</span>
          <span className="cn">{siteCopy.home.readyVehicles.CN}</span>
        </article>
        <article className="statCard">
          <span className="statValue">{stats.readyMaterialCount}</span>
          <span className="en">{siteCopy.home.readyMaterials.EN}</span>
          <span className="cn">{siteCopy.home.readyMaterials.CN}</span>
        </article>
        <article className="statCard">
          <span className="statValue">{stats.comingSoonCount}</span>
          <span className="en">{siteCopy.home.comingSoon.EN}</span>
          <span className="cn">{siteCopy.home.comingSoon.CN}</span>
        </article>
        <article className="statCard">
          <span className="statValue">{stats.generalLibraryCount}</span>
          <span className="en">{siteCopy.home.generalLibraries.EN}</span>
          <span className="cn">{siteCopy.home.generalLibraries.CN}</span>
        </article>
      </div>
      <div className="sectionHeader">
  <h2><span className="en">{siteCopy.home.latestUpdates.EN}</span><span className="cn">{siteCopy.home.latestUpdates.CN}</span></h2>
  <Link className="back-btn small-btn" href="/updates">
    <span className="en">{siteCopy.common.EN.viewAll}</span><span className="cn">{siteCopy.common.CN.viewAll}</span>
  </Link>
</div>
      <div className="grid">
        {updates.map(v => (
          <article className="card vehicleCard" key={v.vehicle}>
            <div className="vehicleImage">
              {v.image ? (
                <OptimizedImage src={v.image} alt={v.vehicle} sizes="(max-width: 860px) 100vw, 320px" />
              ) : (
                <div className="imagePlaceholder">
                  <span className="en">Vehicle Image</span>
                  <span className="cn">车型图片</span>
                </div>
              )}
            </div>
            <div className="cardBody">
              <div className="eyebrow"><span className="en">{siteCopy.common.EN.updated}</span><span className="cn">{siteCopy.common.CN.updated}</span></div>
              <h3>{v.vehicle}</h3>
              <p><span className="en">{v.vehicle} materials updated - {v.lastUpdated}</span><span className="cn">{v.vehicle} 资料已更新 - {v.lastUpdated}</span></p>
              <Link className="primaryLink" href={`/vehicles/${v.vehicle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`}><span className="en">{siteCopy.common.EN.open}</span><span className="cn">{siteCopy.common.CN.open}</span></Link>
            </div>
          </article>
        ))}
      </div>
      <section className="supportCallout">
        <div>
          <h2><span className="en">{siteCopy.home.supportTitle.EN}</span><span className="cn">{siteCopy.home.supportTitle.CN}</span></h2>
          <p className="en">{siteCopy.home.supportBody.EN}</p>
          <p className="cn">{siteCopy.home.supportBody.CN}</p>
        </div>
        <Link className="primaryLink" href="/request">
          <span className="en">{siteCopy.home.supportAction.EN}</span>
          <span className="cn">{siteCopy.home.supportAction.CN}</span>
        </Link>
      </section>
      <p className="footerNote">
        <span className="en">{siteCopy.home.footer.EN}</span>
        <span className="cn">{siteCopy.home.footer.CN}</span>
      </p>
    </>
  );
}
