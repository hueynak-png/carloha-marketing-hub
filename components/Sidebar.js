"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import MarketingAssistant from "./MarketingAssistant";
import { CARLOHA_WIKI_URL } from "../lib/config";
import { siteCopy } from "../lib/siteCopy";

export default function Sidebar() {
  const pathname = usePathname();
  const showHowToUseOnMobile = pathname === "/";

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Image src="/logo.png" width={164} height={51} alt="Carloha logo" priority />
        <span>Marketing Hub</span>
      </Link>

      <LanguageToggle />

      <nav>
        {siteCopy.sidebar.nav.map(item => (
          <Link key={item.href} href={item.href}>
            <span className="en">{item.EN}</span>
            <span className="cn">{item.CN}</span>
          </Link>
        ))}

        <a
          href={CARLOHA_WIKI_URL}
          target="_blank"
          rel="noreferrer"
          className="wiki-link"
        >
          {siteCopy.common.EN.wiki}
        </a>
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
