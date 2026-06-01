"use client";

export default function ListingSearchPanel({
  language,
  label,
  value,
  onChange,
  placeholder,
  resultCount,
  totalCount,
  quickFilters = [],
  onClear,
}) {
  const hasQuery = Boolean(String(value || "").trim());

  return (
    <section className="listingSearchPanel" aria-label={label}>
      <label className="listingSearchInput">
        <span>{label}</span>
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      {hasQuery ? (
        <div className="listingSearchMeta">
          <button type="button" onClick={onClear}>
            {language === "CN" ? "清空" : "Clear"}
          </button>
        </div>
      ) : null}

      {quickFilters.length ? (
        <div className="searchShortcuts listingSearchShortcuts" aria-label={language === "CN" ? "快捷筛选" : "Quick filters"}>
          {quickFilters.map(filter => (
            <button type="button" key={filter.value} onClick={() => onChange(filter.value)}>
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
