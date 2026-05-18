"use client";
import { useMemo, useState } from "react";
import MaterialButton from "./MaterialButton";
import useLanguage from "./useLanguage";
import { translateValue } from "../lib/translations";

const copy = {
  EN: {
    placeholder: "Search by vehicle or material type...",
    results: "Search Results",
    material: "Material",
    noResults: "No matching materials found.",
    open: "Open",
  },
  CN: {
    placeholder: "按车型或资料类型搜索...",
    results: "搜索结果",
    material: "资料",
    noResults: "没有找到匹配的资料。",
    open: "打开",
  },
};

export default function SearchBox({ items }) {
  const language = useLanguage();
  const t = copy[language] || copy.EN;
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return items.filter(item => [item.Vehicle, item.Category, item["Material Type"], item.Title, item.Status]
      .filter(Boolean).join(" ").toLowerCase().includes(s)).slice(0, 12);
  }, [q, items]);
  return (
    <section className="searchPanel">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.placeholder} />
      {q && (
        <div className="searchResults">
          <h3>{t.results}</h3>
          {results.length ? results.map((item, idx) => (
            <div className="resultRow" key={`${item.Title}-${idx}`}>
              <div>
                <strong>{item.Title || item.Category}</strong>
                <p>
                  {language === "CN" ? translateValue(item.Vehicle || item.Category) : item.Vehicle || item.Category}
                  {" · "}
                  {language === "CN"
                    ? translateValue(item["Material Type"] || item["File Format"], t.material)
                    : item["Material Type"] || item["File Format"] || t.material}
                </p>
              </div>
              <MaterialButton link={item["Google Drive Link"]} status={item.Status} label={t.open} cnLabel="打开" />
            </div>
          )) : <p>{t.noResults}</p>}
        </div>
      )}
    </section>
  );
}
