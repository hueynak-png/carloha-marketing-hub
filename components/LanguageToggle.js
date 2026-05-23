"use client";
import { useEffect, useState } from "react";

const LANG_KEY = "carloha_lang";

function getStoredLang() {
  try {
    return localStorage.getItem(LANG_KEY) === "CN" ? "CN" : "EN";
  } catch {
    return "EN";
  }
}

export default function LanguageToggle() {
  const [lang, setLang] = useState("EN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredLang();
    setLang(stored);
    document.documentElement.dataset.lang = stored;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
  }, [lang, mounted]);
  return (
    <div className="langToggle" aria-label="Language switch">
      <button className={lang === "EN" ? "active" : ""} onClick={() => setLang("EN")}>EN</button>
      <button className={lang === "CN" ? "active" : ""} onClick={() => setLang("CN")}>中文</button>
    </div>
  );
}
