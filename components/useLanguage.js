"use client";

import { useEffect, useState } from "react";

function currentLanguage() {
  if (typeof document === "undefined") return "EN";
  return document.documentElement.dataset.lang || "EN";
}

export default function useLanguage() {
  const [language, setLanguage] = useState(currentLanguage);

  useEffect(() => {
    function syncLanguage() {
      setLanguage(currentLanguage());
    }

    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });

    window.addEventListener("languagechange", syncLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener("languagechange", syncLanguage);
    };
  }, []);

  return language;
}
