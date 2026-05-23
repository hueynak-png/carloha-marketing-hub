import MaterialButton from "../../../components/MaterialButton";
import { getVehicleMaterials, groupByVehicle, slugify } from "../../../lib/data";
import { siteCopy } from "../../../lib/siteCopy";
import { translateValue } from "../../../lib/translations";

export async function generateStaticParams() {
  const materials = await getVehicleMaterials();
  return groupByVehicle(materials).map(v => ({ slug: slugify(v.vehicle) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const materials = await getVehicleMaterials();
  const vehicle = groupByVehicle(materials).find(v => slugify(v.vehicle) === slug);
  const name = vehicle?.vehicle || slug;
  return {
    title: `${name} — Vehicle Materials`,
    description: `Official marketing materials for ${name}: brochures, photos, videos, and training assets. Carloha Nigeria.`,
  };
}

export default async function VehicleDetail({ params }) {
  const { slug } = await params;
  const materials = await getVehicleMaterials();
  const vehicle = groupByVehicle(materials).find(
    v => slugify(v.vehicle) === slug
  );

  if (!vehicle) {
    return (
      <>
        <h1><span className="en">{siteCopy.vehicles.notFound.EN}</span><span className="cn">{siteCopy.vehicles.notFound.CN}</span></h1>
        <a href="/vehicles" className="back-btn">
          <span className="en">{siteCopy.vehicles.backToList.EN}</span>
          <span className="cn">{siteCopy.vehicles.backToList.CN}</span>
        </a>
      </>
    );
  }

  return (
    <>
      <div className="detailHeader">
        <div>
          <h1 className="pageTitle">{vehicle.vehicle}</h1>
          <p className="muted">
            <span className="en">
              Official marketing materials for {vehicle.vehicle}. Last Updated:{" "}
              {vehicle.lastUpdated || "Coming Soon"}
            </span>
            <span className="cn">
              {vehicle.vehicle} 官方市场资料。最后更新：{vehicle.lastUpdated || "即将上线"}
            </span>
          </p>

          <a href="/vehicles" className="back-btn">
            <span className="en">{siteCopy.vehicles.backToList.EN}</span>
            <span className="cn">{siteCopy.vehicles.backToList.CN}</span>
          </a>
        </div>

        <div className="vehicleImage card">
          {vehicle.image ? (
            <img src={vehicle.image} alt={vehicle.vehicle} />
          ) : (
            <div className="imagePlaceholder">
              <span className="en">{siteCopy.vehicles.imagePlaceholder.EN}</span>
              <span className="cn">{siteCopy.vehicles.imagePlaceholder.CN}</span>
            </div>
          )}
        </div>
      </div>

      <section className="infoBox">
        <h2><span className="en">{siteCopy.vehicles.availableMaterials.EN}</span><span className="cn">{siteCopy.vehicles.availableMaterials.CN}</span></h2>
        <div className="buttonGrid">
          {vehicle.items.map(item => (
            <MaterialButton
              key={item["Material Type"]}
              link={item["Google Drive Link"]}
              status={item.Status}
              label={item["Material Type"]}
              cnLabel={translateValue(item["Material Type"])}
              analyticsMeta={{
                vehicle: vehicle.vehicle,
                materialType: item["Material Type"],
                title: item.Title || `${vehicle.vehicle} ${item["Material Type"]}`,
              }}
              requestMeta={{
                vehicle: vehicle.vehicle,
                materialType: item["Material Type"],
                title: item.Title || `${vehicle.vehicle} ${item["Material Type"]}`,
              }}
            />
          ))}
        </div>
        <p className="muted">
          <span className="en">{siteCopy.vehicles.driveNotice.EN}</span>
          <span className="cn">{siteCopy.vehicles.driveNotice.CN}</span>
        </p>
      </section>
    </>
  );
}
