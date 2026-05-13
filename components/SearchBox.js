"use client";
import { useMemo, useState } from "react";
import MaterialButton from "./MaterialButton";

export default function SearchBox({ items }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return items.filter(item => [item.Vehicle, item.Category, item["Material Type"], item.Title, item.Status]
      .filter(Boolean).join(" ").toLowerCase().includes(s)).slice(0, 12);
  }, [q, items]);
  return (
    <section className="searchPanel">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by vehicle or material type..." />
      {q && (
        <div className="searchResults">
          <h3>Search Results</h3>
          {results.length ? results.map((item, idx) => (
            <div className="resultRow" key={`${item.Title}-${idx}`}>
              <div>
                <strong>{item.Title || item.Category}</strong>
                <p>{item.Vehicle || item.Category} · {item["Material Type"] || item["File Format"] || "Material"}</p>
              </div>
              <MaterialButton link={item["Google Drive Link"]} status={item.Status} label="Open" />
            </div>
          )) : <p>No matching materials found.</p>}
        </div>
      )}
    </section>
  );
}
