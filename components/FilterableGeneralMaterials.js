"use client";

import { useMemo, useState } from "react";
import MaterialButton from "./MaterialButton";
import useLanguage from "./useLanguage";
import { siteCopy } from "../lib/siteCopy";
import { generalDescriptions, translateValue } from "../lib/translations";

function matchesMaterial(item, query) {
  if (!query) return true;
  const haystack = [
    item.Category,
    item.Description,
    item.Title,
    item["File Format"],
    item.Status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function FilterableGeneralMaterials({ materials }) {
  const language = useLanguage();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredMaterials = useMemo(
    () => materials.filter(item => matchesMaterial(item, normalizedQuery)),
    [materials, normalizedQuery]
  );

  return (
    <>
      <div className="pageHeaderWithSearch">
        <div>
          <h1 className="pageTitle">
            {siteCopy.general.title[language]}
          </h1>
          <p className="muted">
            {siteCopy.general.intro[language]}
          </p>
        </div>
        <label className="compactSearch">
          <span>{language === "CN" ? "搜索资料" : "Search materials"}</span>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={language === "CN" ? "输入分类或资料类型..." : "Category or material type..."}
          />
        </label>
      </div>

      {filteredMaterials.length ? (
        <div className="grid">
          {filteredMaterials.map(item => (
            <article className="card" key={item.Category}>
              <div className="cardBody">
                <div className="eyebrow">
                  <span className="en">{item.Status}</span>
                  <span className="cn">{translateValue(item.Status)}</span>
                </div>
                <h3>
                  <span className="en">{item.Category}</span>
                  <span className="cn">{translateValue(item.Category)}</span>
                </h3>
                <p>
                  <span className="en">{item.Description}</span>
                  <span className="cn">{generalDescriptions[item.Category] || item.Description}</span>
                </p>
                <MaterialButton
                  link={item["Google Drive Link"]}
                  status={item.Status}
                  label={siteCopy.general.openFolder.EN}
                  cnLabel={siteCopy.general.openFolder.CN}
                  analyticsMeta={{
                    category: item.Category,
                    materialType: item["File Format"] || "Folder",
                    title: item.Title || item.Category,
                  }}
                  requestMeta={{
                    category: item.Category,
                    materialType: item["File Format"] || item.Category,
                    title: item.Title || item.Category,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="emptyState">{language === "CN" ? "没有找到匹配的通用资料。" : "No matching general materials found."}</p>
      )}
    </>
  );
}
