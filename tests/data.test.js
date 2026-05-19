import test from "node:test";
import assert from "node:assert/strict";

import { normalizeGeneralMaterials, normalizeVehicleMaterials, parseCsv, slugify } from "../lib/data.js";

test("parseCsv handles quoted commas", () => {
  const rows = parseCsv('Vehicle,Title\n"Tiggo 9","Brochure, English"');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Vehicle, "Tiggo 9");
  assert.equal(rows[0].Title, "Brochure, English");
});

test("normalizeVehicleMaterials maps legacy Chery Q names and filters invalid rows", () => {
  const { cleaned, warnings } = normalizeVehicleMaterials([
    { Vehicle: "Q3", "Material Type": "Brochures", Status: "", "Vehicle Image": "/vehicles/qq3.png", "Google Drive Link": "https://drive.google.com/example" },
    { Vehicle: "", "Material Type": "Videos" },
  ]);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].Vehicle, "Chery Q");
  assert.equal(cleaned[0]["Vehicle Image"], "/vehicles/chery-q.png");
  assert.equal(cleaned[0].Status, "Ready");
  assert.equal(warnings.length, 1);
});

test("normalizeGeneralMaterials keeps valid rows and normalizes status", () => {
  const { cleaned, warnings } = normalizeGeneralMaterials([
    { Category: "Brand Assets", Title: "", Description: "", Status: "", "Google Drive Link": "https://drive.google.com/example" },
    { Category: "", Title: "Bad row" },
  ]);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].Category, "Brand Assets");
  assert.equal(cleaned[0].Title, "Brand Assets");
  assert.equal(cleaned[0].Status, "Ready");
  assert.equal(warnings.length, 1);
});

test("normalizeVehicleMaterials accepts sheet aliases and Chinese coming-soon status", () => {
  const { cleaned, warnings } = normalizeVehicleMaterials([
    {
      车型: "Tiggo 9",
      资料类型: "Brochures",
      状态: "即将上线",
      资料链接: "",
      最后更新: "2026-05",
    },
  ]);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].Vehicle, "Tiggo 9");
  assert.equal(cleaned[0]["Material Type"], "Brochures");
  assert.equal(cleaned[0].Status, "Coming Soon");
  assert.equal(cleaned[0]["Google Drive Link"], "Coming Soon");
  assert.equal(cleaned[0]["Last Updated"], "2026-05");
  assert.equal(warnings.length, 0);
});

test("normalizeGeneralMaterials warns when ready rows are missing links", () => {
  const { cleaned, warnings } = normalizeGeneralMaterials([
    { 分类: "Logo", 状态: "Ready", 描述: "Logo files" },
  ]);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].Category, "Logo");
  assert.equal(cleaned[0].Status, "Ready");
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].reason, "Ready general material missing Google Drive Link");
});

test("slugify creates stable slugs", () => {
  assert.equal(slugify("Chery Q"), "chery-q");
  assert.equal(slugify("iCAUR V23"), "icaur-v23");
});
