"use client";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const [lang, setLang] = useState("EN");
  useEffect(() => {
    document.documentElement.dataset.lang = lang;
  }, [lang]);
  return (
    <div className="langToggle" aria-label="Language switch">
      <button className={lang === "EN" ? "active" : ""} onClick={() => setLang("EN")}>EN</button>
      <button className={lang === "CN" ? "active" : ""} onClick={() => setLang("CN")}>中文</button>
    </div>
  );
}
