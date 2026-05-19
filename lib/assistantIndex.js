import { CARLOHA_WIKI_URL } from "./config.js";
import { logError } from "./logger.js";

const WIKI_CACHE_MS = 1000 * 60 * 15;
const CONTEXT_LIMIT = 16000;

let wikiCache = {
  loadedAt: 0,
  entries: [],
};

function wikiBaseUrl() {
  return CARLOHA_WIKI_URL.replace(/\/$/, "");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

export function stripContent(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_#>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textValue(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return stripContent(value);
  return stripContent(value[lang] || value.en || value.zh || "");
}

export function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(token => token.length >= 2)
    .slice(0, 24);
}

export async function getWikiEntries() {
  const now = Date.now();
  if (wikiCache.entries.length && now - wikiCache.loadedAt < WIKI_CACHE_MS) {
    return wikiCache.entries;
  }

  try {
    const base = wikiBaseUrl();
    const manifest = await fetchJson(`${base}/data/content/manifest.json`);
    const files = [];

    for (const [l1Id, l2List] of Object.entries(manifest.content || {})) {
      for (const l2 of l2List || []) {
        for (const l3Id of l2.L3_files || []) {
          files.push({
            l1Id,
            l2Id: l2.L2_id,
            l2Title: l2.L2_title,
            url: `${base}/data/content/${l1Id}/${l2.L2_id}/${l3Id}.json`,
          });
        }
      }
    }

    const loaded = await Promise.all(
      files.map(file =>
        fetchJson(file.url)
          .then(entry => ({
            ...entry,
            L1_id: file.l1Id,
            L2_id: file.l2Id,
            L2_title: file.l2Title || entry.L2_title,
          }))
          .catch(() => null)
      )
    );

    wikiCache = {
      loadedAt: now,
      entries: loaded.filter(Boolean),
    };
  } catch (error) {
    logError("Failed to load Carloha Wiki context", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return wikiCache.entries;
}

function scoreTerms(text, terms) {
  const haystack = String(text || "").toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (!haystack.includes(term)) continue;
    score += term.length > 3 ? 3 : 1;
  }
  return score;
}

function normalizeVehicleDoc(item) {
  const title = item.Title || `${item.Vehicle} ${item["Material Type"]}`;
  const url = item["Google Drive Link"] && item["Google Drive Link"] !== "Coming Soon" ? item["Google Drive Link"] : "";
  return {
    kind: "vehicle",
    title,
    subtitle: [item.Vehicle, item["Material Type"], item.Status].filter(Boolean).join(" · "),
    url,
    status: item.Status || "Ready",
    text: [
      item.Vehicle,
      item["Material Type"],
      title,
      item.Description,
      item.Status,
      item["Last Updated"],
    ].filter(Boolean).join(" "),
    context: `- Vehicle material: ${item.Vehicle} | ${item["Material Type"]} | ${title} | ${item.Status || "Ready"} | ${url || "Coming Soon"}`,
  };
}

function normalizeGeneralDoc(item) {
  const title = item.Title || item.Category;
  const url = item["Google Drive Link"] && item["Google Drive Link"] !== "Coming Soon" ? item["Google Drive Link"] : "";
  return {
    kind: "general",
    title,
    subtitle: [item.Category, item.Status].filter(Boolean).join(" · "),
    url,
    status: item.Status || "Ready",
    text: [
      item.Category,
      title,
      item.Description,
      item.Status,
      item["Last Updated"],
    ].filter(Boolean).join(" "),
    context: `- General material: ${item.Category} | ${title} | ${item.Status || "Ready"} | ${url || "Coming Soon"}`,
  };
}

function normalizeWikiDoc(entry) {
  const title = textValue(entry.question, "en") || textValue(entry.question, "zh") || "Carloha Wiki";
  const category = textValue(entry.L2_title, "en") || textValue(entry.L2_title, "zh") || "Carloha Wiki";
  return {
    kind: "wiki",
    title,
    subtitle: category,
    url: CARLOHA_WIKI_URL,
    status: "Ready",
    text: [
      textValue(entry.question, "en"),
      textValue(entry.question, "zh"),
      textValue(entry.short_answer, "en"),
      textValue(entry.short_answer, "zh"),
      textValue(entry.detailed_content, "en"),
      textValue(entry.detailed_content, "zh"),
      ...(entry.tags || []),
    ].join(" "),
    context: [
      `- Wiki category: ${category}`,
      `  Question EN: ${textValue(entry.question, "en")}`,
      `  Answer EN: ${textValue(entry.short_answer, "en")}`,
      `  Question ZH: ${textValue(entry.question, "zh")}`,
      `  Answer ZH: ${textValue(entry.short_answer, "zh")}`,
      `  Detail EN: ${textValue(entry.detailed_content, "en").slice(0, 650)}`,
      `  Detail ZH: ${textValue(entry.detailed_content, "zh").slice(0, 650)}`,
      `  Tags: ${(entry.tags || []).join(", ")}`,
    ].join("\n"),
  };
}

export function buildAssistantIndex(vehicleMaterials = [], generalMaterials = [], wikiEntries = []) {
  return [
    ...vehicleMaterials.map(normalizeVehicleDoc),
    ...generalMaterials.map(normalizeGeneralDoc),
    ...wikiEntries.map(normalizeWikiDoc),
  ];
}

export function retrieveAssistantContext(index = [], query = "", limit = 10) {
  const terms = tokenize(query);
  if (!terms.length) return { context: "", sources: [] };

  const ranked = index
    .map(doc => {
      let score = scoreTerms(doc.text, terms);
      if (doc.status === "Ready") score += 1;
      if (doc.kind === "wiki") score += 1;
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  let output = "";
  for (const doc of ranked) {
    if ((output + "\n" + doc.context).length > CONTEXT_LIMIT) break;
    output += `${doc.context}\n`;
  }

  const dedupedSources = [];
  const seen = new Set();
  for (const doc of ranked) {
    const key = `${doc.kind}:${doc.title}:${doc.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedSources.push({
      kind: doc.kind,
      title: doc.title,
      subtitle: doc.subtitle,
      url: doc.url,
    });
    if (dedupedSources.length >= 4) break;
  }

  return {
    context: output.trim(),
    sources: dedupedSources,
  };
}
