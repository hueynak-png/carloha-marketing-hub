import Link from "next/link";
import MaterialButton from "../../../components/MaterialButton";
import { getVehicleMaterials, groupByVehicle, slugify } from "../../../lib/data";

export async function generateStaticParams() {
  const materials = await getVehicleMaterials();
  return groupByVehicle(materials).map(v => ({ slug: slugify(v.vehicle) }));
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
        <h1>Vehicle not found</h1>
        <a href="/vehicles" className="back-btn">
          ← Back to Vehicle Materials
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
            Official marketing materials for {vehicle.vehicle}. Last Updated:{" "}
            {vehicle.lastUpdated || "Coming Soon"}
          </p>

          <a href="/vehicles" className="back-btn">
            ← Back to Vehicle Materials
          </a>
        </div>

        <div className="vehicleImage card">
          {vehicle.image ? (
            <img src={vehicle.image} alt={vehicle.vehicle} />
          ) : (
            <div className="imagePlaceholder">Vehicle Image</div>
          )}
        </div>
      </div>

      <section className="infoBox">
        <h2>Available Materials</h2>
        <div className="buttonGrid">
          {vehicle.items.map(item => (
            <MaterialButton
              key={item["Material Type"]}
              link={item["Google Drive Link"]}
              status={item.Status}
              label={item["Material Type"]}
            />
          ))}
        </div>
        <p className="muted">
          Files open in Google Drive. Access permission may be required for some
          materials.
        </p>
      </section>
    </>
  );
}
