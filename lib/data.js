import { SHEETS } from "./config";
import { seedVehicleMaterials, seedGeneralMaterials, vehicleOrder, materialTypeOrder, generalOrder } from "./seedData";

function parseCsv(text) {
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
    if (!res.ok) return fallback;
    const text = await res.text();
    const parsed = parseCsv(text);
    return parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function getVehicleMaterials() {
  const data = await fetchCsv(SHEETS.vehicleCsvUrl, seedVehicleMaterials);

  const cleaned = data
    .map(item => ({
      ...item,
      Vehicle: item.Vehicle || item["Vehicle Name"] || item.vehicle || "",
      "Material Type": item["Material Type"] || item["Material type"] || item.MaterialType || "",
    }))
    .filter(item => item.Vehicle && item["Material Type"]);

  const finalData = cleaned.length ? cleaned : seedVehicleMaterials;

  return finalData.sort((a, b) => {
    const vi =
      vehicleOrder.indexOf(a.Vehicle) - vehicleOrder.indexOf(b.Vehicle);
    if (vi !== 0) return vi;
    return (
      materialTypeOrder.indexOf(a["Material Type"]) -
      materialTypeOrder.indexOf(b["Material Type"])
    );
  });
}

export async function getGeneralMaterials() {
  const data = await fetchCsv(SHEETS.generalCsvUrl, seedGeneralMaterials);
  return data.sort((a, b) => generalOrder.indexOf(a.Category) - generalOrder.indexOf(b.Category));
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
