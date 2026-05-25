"use client";

import { useMemo, useState } from "react";
import MaterialButton from "./MaterialButton";
import useLanguage from "./useLanguage";
import { buildSearchOptions } from "../lib/data.js";
import { getLocalizedCopy } from "../lib/siteCopy.js";
import { translateValue } from "../lib/translations.js";

function normalizeSearchTerm(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "q3" || raw === "qq3") return "chery q";
  return raw;
}

function highlightText(text = "", query = "") {
  if (!query) return text;
  const source = String(text || "");
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = source.split(regex);

  if (parts.length === 1) return source;

  return parts.map((part, index) =>
    index % 2 === 1 ? <mark key={`${part}-${index}`}>{part}</mark> : <span key={`${part}-${index}`}>{part}</span>
  );
}

function isReadyToOpen(item) {
  const link = item["Google Drive Link"];
  return item.Status === "Ready" && Boolean(link) && link !== "Coming Soon";
}

export default function SearchBox({ items }) {
  const language = useLanguage();
  const t = getLocalizedCopy("searchBox", language);
  const [q, setQ] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [scope, setScope] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);

  const options = useMemo(() => buildSearchOptions(items), [items]);
  const normalizedQuery = normalizeSearchTerm(submittedQuery);
  const hasActiveFilters = hasSearched && Boolean(normalizedQuery || scope || type || status || readyOnly);

  const results = useMemo(() => {
    if (!hasActiveFilters) return [];

    return items
      .filter(item => {
        const itemScope = item.Vehicle || item.Category || "";
        const itemType = item["Material Type"] || item["File Format"] || "";
        const itemStatus = item.Status || "";
        const aliasSource = [item.Vehicle, item.Category, item["Material Type"], item.Title, item.Status, item.Description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesQuery = !normalizedQuery || aliasSource.includes(normalizedQuery);
        const matchesScope = !scope || itemScope === scope;
        const matchesType = !type || itemType === type;
        const matchesStatus = (!status || itemStatus === status) && (!readyOnly || isReadyToOpen(item));
        return matchesQuery && matchesScope && matchesType && matchesStatus;
      })
      .slice(0, 12);
  }, [hasActiveFilters, items, normalizedQuery, readyOnly, scope, status, type]);

  function clearFilters() {
    setQ("");
    setSubmittedQuery("");
    setHasSearched(false);
    setScope("");
    setType("");
    setStatus("");
    setReadyOnly(false);
  }

  function applyQuickFilter(nextFilter) {
    setQ("");
    setSubmittedQuery("");
    setHasSearched(true);
    setScope("");
    setType("");
    setStatus("");
    setReadyOnly(false);

    setType(nextFilter);
  }

  function submitSearch(event) {
    event.preventDefault();
    setSubmittedQuery(q);
    setHasSearched(true);
  }

  function renderResultRow(item, idx) {
    const itemScope = item.Vehicle || item.Category;
    const itemType = item["Material Type"] || item["File Format"] || t.material;
    const localizedScope = language === "CN" ? translateValue(itemScope, itemScope) : itemScope;
    const localizedType = language === "CN" ? translateValue(itemType, itemType) : itemType;
    const displayStatus = isReadyToOpen(item) ? item.Status : "Coming Soon";
    const statusLabel = language === "CN" ? translateValue(displayStatus, displayStatus) : displayStatus;

    return (
      <div className="resultRow" key={`${item.Title || itemScope}-${idx}`}>
        <div className="resultMeta">
          <strong>{highlightText(item.Title || itemScope, normalizedQuery)}</strong>
          <p>
            {highlightText(localizedScope, normalizedQuery)}
            {" · "}
            {highlightText(localizedType, normalizedQuery)}
          </p>
          <div className="resultTags">
            <span>{statusLabel}</span>
            {item["Last Updated"] ? <span>{item["Last Updated"]}</span> : null}
          </div>
        </div>
        <MaterialButton
          link={item["Google Drive Link"]}
          status={item.Status}
          label={t.open}
          cnLabel="打开"
          analyticsMeta={{
            vehicle: item.Vehicle || "",
            category: item.Category || "",
            materialType: item["Material Type"] || item["File Format"] || "",
            title: item.Title || item.Category || item.Vehicle || "",
          }}
          requestMeta={{
            vehicle: item.Vehicle || "",
            category: item.Category || "",
            materialType: item["Material Type"] || item["File Format"] || "",
            title: item.Title || item.Category || item.Vehicle || "",
          }}
        />
      </div>
    );
  }

  return (
    <section className="searchPanel">
      <form className="searchInputWrap" onSubmit={submitSearch}>
        <label className="searchLabel" htmlFor="material-search">{t.searchLabel}</label>
        <div className="searchInputRow">
          <input
            id="material-search"
            value={q}
            onChange={event => setQ(event.target.value)}
            placeholder={t.placeholder}
          />
          <button type="submit" className="searchSubmitButton">{t.searchAction}</button>
        </div>
      </form>

      <div className="searchShortcuts" aria-label={language === "CN" ? "快捷筛选" : "Quick filters"}>
        <button type="button" onClick={() => applyQuickFilter("Brochures")}>
          {language === "CN" ? "手册" : "Brochures"}
        </button>
        <button type="button" onClick={() => applyQuickFilter("Official Photos")}>
          {language === "CN" ? "官方图片" : "Photos"}
        </button>
        <button type="button" onClick={() => applyQuickFilter("Official Videos")}>
          {language === "CN" ? "官方视频" : "Videos"}
        </button>
      </div>

      <div className="searchFilters">
        <label>
          <span>{t.filterVehicle}</span>
          <select value={scope} onChange={event => setScope(event.target.value)}>
            <option value="">{t.allVehicles}</option>
            {options.scopes.map(option => (
              <option key={option} value={option}>
                {language === "CN" ? translateValue(option, option) : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.filterType}</span>
          <select value={type} onChange={event => setType(event.target.value)}>
            <option value="">{t.allTypes}</option>
            {options.types.map(option => (
              <option key={option} value={option}>
                {language === "CN" ? translateValue(option, option) : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.filterStatus}</span>
          <select value={status} onChange={event => setStatus(event.target.value)}>
            <option value="">{t.allStatuses}</option>
            {options.statuses.map(option => (
              <option key={option} value={option}>
                {language === "CN" ? translateValue(option, option) : option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="readyToggle">
        <input
          type="checkbox"
          checked={readyOnly}
          onChange={event => setReadyOnly(event.target.checked)}
        />
        <span>{language === "CN" ? "仅显示可直接打开的资料" : "Show only materials that are ready to open"}</span>
      </label>

      {hasActiveFilters ? (
        <div className="searchResults">
          <div className="searchResultsHeader">
            <div>
              <h3>{t.results}</h3>
	              <p>
	                {results.length} {t.resultsSummary}
	                {scope || type || status || readyOnly ? ` · ${t.filtersActive}` : ""}
	              </p>
            </div>
            <button type="button" className="searchClearButton" onClick={clearFilters}>
              {t.clearFilters}
            </button>
          </div>

          {results.length ? results.map(renderResultRow) : <p>{t.noResults}</p>}
        </div>
      ) : null}
    </section>
  );
}
