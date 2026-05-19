import { SHEETS } from "./config.js";
import { logWarn } from "./logger.js";
import { seedVehicleMaterials, seedGeneralMaterials, vehicleOrder, materialTypeOrder, generalOrder } from "./seedData.js";

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && quote && n === '"') { cell += '"'; i++; }
    else if (c === '"') quote = !quote;
    else if (c === ',' && !quote) { row.push(cell); cell = ""; }
    else if ((c === '\n' || c === '\r') && !quote) {
      if (c === '\r' && n === '\n') i++;
      row.push(cell); cell = "";
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(v => v.trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] || "").trim()])));
}

async function fetchCsv(url, fallback) {
  if (!url) return fallback;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      logWarn("CSV fetch failed, using fallback data", { url, status: res.status });
      return fallback;
    }
    const text = await res.text();
    const parsed = parseCsv(text);
    return parsed.length ? parsed : fallback;
  } catch {
    logWarn("CSV fetch threw, using fallback data", { url });
    return fallback;
  }
}

function normalizeVehicleName(name = "") {
  const trimmed = String(name).trim();
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized === "q3" || normalized === "qq3" ? "Chery Q" : trimmed;
}

function normalizeVehicleImage(image = "", vehicle = "") {
  const trimmed = String(image).trim();
  if (trimmed.includes("/vehicles/qq3.png")) return "/vehicles/chery-q.png";
  if (trimmed) return trimmed;
  return vehicle === "Chery Q" ? "/vehicles/chery-q.png" : "";
}

function normalizeStatus(status = "") {
  return String(status).trim() === "Coming Soon" ? "Coming Soon" : "Ready";
}

function sortByOrder(value, order) {
  const index = order.indexOf(value);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function normalizeVehicleMaterials(data = []) {
  const warnings = [];

  const cleaned = data
    .map((item, index) => {
      const vehicle = normalizeVehicleName(item.Vehicle || item["Vehicle Name"] || item.vehicle || "");
      const materialType = item["Material Type"] || item["Material type"] || item.MaterialType || "";
      const normalized = {
        ...item,
        Vehicle: vehicle,
        Status: normalizeStatus(item.Status),
        "Vehicle Image": normalizeVehicleImage(item["Vehicle Image"], vehicle),
        "Material Type": materialType.trim(),
      };

      if (!normalized.Vehicle || !normalized["Material Type"]) {
        warnings.push({
          row: index + 2,
          reason: "Missing Vehicle or Material Type",
          vehicle: normalized.Vehicle,
          materialType: normalized["Material Type"],
        });
        return null;
      }

      return normalized;
    })
    .filter(Boolean);

  return { cleaned, warnings };
}

export function normalizeGeneralMaterials(data = []) {
  const warnings = [];

  const cleaned = data
    .map((item, index) => {
      const normalized = {
        ...item,
        Category: String(item.Category || "").trim(),
        Title: String(item.Title || item.Category || "").trim(),
        Description: String(item.Description || "").trim(),
        Status: normalizeStatus(item.Status),
      };

      if (!normalized.Category) {
        warnings.push({
          row: index + 2,
          reason: "Missing Category",
          title: normalized.Title,
        });
        return null;
      }

      return normalized;
    })
    .filter(Boolean);

  return { cleaned, warnings };
}

export async function getVehicleMaterials() {
  const data = await fetchCsv(SHEETS.vehicleCsvUrl, seedVehicleMaterials);
  const { cleaned, warnings } = normalizeVehicleMaterials(data);
  if (warnings.length) {
    logWarn("Vehicle material validation warnings", {
      count: warnings.length,
      sample: warnings.slice(0, 5),
    });
  }

  const finalData = cleaned.length ? cleaned : seedVehicleMaterials;

  return finalData.sort((a, b) => {
    const vi = sortByOrder(a.Vehicle, vehicleOrder) - sortByOrder(b.Vehicle, vehicleOrder);
    if (vi !== 0) return vi;
    return sortByOrder(a["Material Type"], materialTypeOrder) - sortByOrder(b["Material Type"], materialTypeOrder);
  });
}

export async function getGeneralMaterials() {
  const data = await fetchCsv(SHEETS.generalCsvUrl, seedGeneralMaterials);
  const { cleaned, warnings } = normalizeGeneralMaterials(data);
  if (warnings.length) {
    logWarn("General material validation warnings", {
      count: warnings.length,
      sample: warnings.slice(0, 5),
    });
  }

  const finalData = cleaned.length ? cleaned : seedGeneralMaterials;
  return finalData.sort((a, b) => sortByOrder(a.Category, generalOrder) - sortByOrder(b.Category, generalOrder));
}

export function groupByVehicle(materials) {
  const map = new Map();
  materials.forEach(item => {
    if (!map.has(item.Vehicle)) map.set(item.Vehicle, []);
    map.get(item.Vehicle).push(item);
  });
  return [...map.entries()].map(([vehicle, items]) => ({
    vehicle,
    image: items.find(i => i["Vehicle Image"])?.["Vehicle Image"] || "",
    lastUpdated: items.find(i => i["Last Updated"])?.["Last Updated"] || "",
    status: items.every(i => i.Status === "Coming Soon") ? "Coming Soon" : "Ready",
    items
  }));
}

export function slugify(name = "") {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function latestVehicleUpdates(materials, limit = 5) {
  return groupByVehicle(materials)
    .filter(v => v.lastUpdated)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function buildSearchOptions(items = []) {
  const values = {
    scopes: new Set(),
    types: new Set(),
    statuses: new Set(),
  };

  items.forEach(item => {
    const scope = item.Vehicle || item.Category;
    const type = item["Material Type"] || item["File Format"];
    const status = item.Status;

    if (scope) values.scopes.add(scope);
    if (type) values.types.add(type);
    if (status) values.statuses.add(status);
  });

  return {
    scopes: [...values.scopes].sort((a, b) => a.localeCompare(b)),
    types: [...values.types].sort((a, b) => a.localeCompare(b)),
    statuses: [...values.statuses].sort((a, b) => a.localeCompare(b)),
  };
}

export function getMaterialStats(vehicleMaterials = [], generalMaterials = []) {
  const vehicleGroups = groupByVehicle(vehicleMaterials);
  const readyVehicleCount = vehicleGroups.filter(vehicle => vehicle.status === "Ready").length;
  const readyMaterialCount = [...vehicleMaterials, ...generalMaterials].filter(item => item.Status === "Ready").length;
  const comingSoonCount = [...vehicleMaterials, ...generalMaterials].filter(item => item.Status === "Coming Soon").length;
  const generalLibraryCount = generalMaterials.length;

  return {
    readyVehicleCount,
    readyMaterialCount,
    comingSoonCount,
    generalLibraryCount,
  };
}

export function getPopularMaterials(vehicleMaterials = [], limit = 4) {
  const preferredTypes = ["Brochures", "Official Photos", "Official Videos", "Specification Sheet", "Training Materials"];
  const sorted = vehicleMaterials
    .filter(item => item.Status === "Ready" && item["Google Drive Link"] && item["Google Drive Link"] !== "Coming Soon")
    .sort((a, b) => {
      const typeDelta = sortByOrder(a["Material Type"], preferredTypes) - sortByOrder(b["Material Type"], preferredTypes);
      if (typeDelta !== 0) return typeDelta;
      const dateDelta = String(b["Last Updated"] || "").localeCompare(String(a["Last Updated"] || ""));
      if (dateDelta !== 0) return dateDelta;
      return String(a.Vehicle).localeCompare(String(b.Vehicle));
    });

  const seen = new Set();
  const result = [];

  for (const item of sorted) {
    const key = `${item.Vehicle}:${item["Material Type"]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }

  return result;
}
