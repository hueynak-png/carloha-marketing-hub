"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import MarketingAssistant from "./MarketingAssistant";
import useLanguage from "./useLanguage";
import { CARLOHA_WIKI_URL } from "../lib/config";
import { siteCopy } from "../lib/siteCopy";

export default function Sidebar() {
  const pathname = usePathname();
  const language = useLanguage();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const showHowToUseOnMobile = pathname === "/";
  const [homeItem, ...navItems] = siteCopy.sidebar.nav;
  const allNavItems = useMemo(() => [homeItem, ...navItems], [homeItem, navItems]);
  const activeItem = allNavItems.find(item => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }) || homeItem;

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  function isActive(item) {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Image src="/logo.png" width={164} height={51} alt="Carloha logo" priority />
        <span>Marketing Hub</span>
      </Link>

      <LanguageToggle />

      <nav className="sidebarNav">
        <p className="sidebarNavLabel">
          {siteCopy.sidebar.navLabel[language]}
        </p>

        <button
          className="mobileNavToggle"
          type="button"
          aria-expanded={isMobileNavOpen}
          onClick={() => setIsMobileNavOpen(current => !current)}
        >
          <span>
            <small>{language === "CN" ? "当前页面" : "Current page"}</small>
            <strong>{activeItem[language]}</strong>
          </span>
          <b>{isMobileNavOpen ? "-" : "+"}</b>
        </button>

        <div className={`sidebarNavMenu ${isMobileNavOpen ? "open" : ""}`}>
          <Link
            href={homeItem.href}
            className={`sidebarNavItem sidebarHomeLink ${isActive(homeItem) ? "active" : ""}`}
          >
            <span className="sidebarNavCopy">
              <strong>{homeItem[language]}</strong>
            </span>
          </Link>

          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebarNavItem ${isActive(item) ? "active" : ""}`}
            >
              <span className="sidebarNavIndex">{String(index + 1).padStart(2, "0")}</span>
              <span className="sidebarNavCopy">
                <strong>{item[language]}</strong>
                <small>{item[`${language}_HINT`]}</small>
              </span>
            </Link>
          ))}

          <a
            href={CARLOHA_WIKI_URL}
            target="_blank"
            rel="noreferrer"
            className="wiki-link sidebarNavItem sidebarWikiLink"
          >
            <span className="sidebarNavIndex">WK</span>
            <span className="sidebarNavCopy">
              <strong>{siteCopy.common[language].wiki}</strong>
              <small>
                {language === "CN"
                  ? "在新标签页中打开完整 Carloha Wiki 知识库。"
                  : "Open the full Carloha knowledge base in a new tab."}
              </small>
            </span>
          </a>
        </div>
      </nav>

      <section className={`sideCard howToUseBox ${showHowToUseOnMobile ? "showOnMobile" : ""}`}>
        <h3>
          <span className="en">{siteCopy.sidebar.howToUseTitle.EN}</span>
          <span className="cn">{siteCopy.sidebar.howToUseTitle.CN}</span>
        </h3>

        <ul className="en">
          {siteCopy.sidebar.howToUseItems.EN.map(item => <li key={item}>{item}</li>)}
        </ul>

        <ul className="cn">
          {siteCopy.sidebar.howToUseItems.CN.map(item => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <MarketingAssistant />
    </aside>
  );
}
