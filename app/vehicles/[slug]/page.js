import Link from "next/link";
import MaterialButton from "../../../components/MaterialButton";
import { getVehicleMaterials, groupByVehicle, slugify } from "../../../lib/data";
import { translateValue } from "../../../lib/translations";

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
        <h1><span className="en">Vehicle not found</span><span className="cn">未找到车型</span></h1>
        <a href="/vehicles" className="back-btn">
          <span className="en">← Back to Vehicle Materials</span>
          <span className="cn">← 返回车型资料</span>
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
            <span className="en">← Back to Vehicle Materials</span>
            <span className="cn">← 返回车型资料</span>
          </a>
        </div>

        <div className="vehicleImage card">
          {vehicle.image ? (
            <img src={vehicle.image} alt={vehicle.vehicle} />
          ) : (
            <div className="imagePlaceholder">
              <span className="en">Vehicle Image</span>
              <span className="cn">车型图片</span>
            </div>
          )}
        </div>
      </div>

      <section className="infoBox">
        <h2><span className="en">Available Materials</span><span className="cn">可用资料</span></h2>
        <div className="buttonGrid">
          {vehicle.items.map(item => (
            <MaterialButton
              key={item["Material Type"]}
              link={item["Google Drive Link"]}
              status={item.Status}
              label={item["Material Type"]}
              cnLabel={translateValue(item["Material Type"])}
            />
          ))}
        </div>
        <p className="muted">
          <span className="en">
            Files open in Google Drive. Access permission may be required for some
            materials.
          </span>
          <span className="cn">
            文件将在 Google Drive 中打开，部分资料可能需要访问权限。
          </span>
        </p>
      </section>
    </>
  );
}
