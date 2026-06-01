"use client";

import { useMemo, useState } from "react";
import ListingSearchPanel from "./ListingSearchPanel";
import VehicleCard from "./VehicleCard";
import useLanguage from "./useLanguage";
import { siteCopy } from "../lib/siteCopy";

function matchesVehicle(vehicle, query) {
  if (!query) return true;
  const haystack = [
    vehicle.vehicle,
    vehicle.status,
    vehicle.lastUpdated,
    ...(vehicle.items || []).flatMap(item => [
      item["Material Type"],
      item.Title,
      item.Description,
      item.Status,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function FilterableVehicleMaterials({ vehicles }) {
  const language = useLanguage();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredVehicles = useMemo(
    () => vehicles.filter(vehicle => matchesVehicle(vehicle, normalizedQuery)),
    [vehicles, normalizedQuery]
  );

  return (
    <>
      <div className="pageHeaderWithSearch">
        <div>
          <h1 className="pageTitle">
            {siteCopy.vehicles.title[language]}
          </h1>
          <p className="muted">
            {siteCopy.vehicles.intro[language]}
          </p>
        </div>
        <ListingSearchPanel
          language={language}
          label={language === "CN" ? "搜索车型资料" : "Search vehicle materials"}
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder={language === "CN" ? "输入车型、资料类型或状态..." : "Vehicle, material type, or status..."}
          resultCount={filteredVehicles.length}
          totalCount={vehicles.length}
        />
      </div>

      {filteredVehicles.length ? (
        <div className="grid">
          {filteredVehicles.map(vehicle => <VehicleCard key={vehicle.vehicle} vehicle={vehicle} />)}
        </div>
      ) : (
        <p className="emptyState">{language === "CN" ? "没有找到匹配的车型资料。" : "No matching vehicle materials found."}</p>
      )}
    </>
  );
}
