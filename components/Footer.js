"use client";

import { CONTACT } from "../lib/config";
import useLanguage from "./useLanguage";

export default function Footer() {
  const language = useLanguage();
  const isChinese = language === "CN";

  return (
    <footer className="globalFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <strong>{isChinese ? "Carloha 营销资料中心" : "Carloha Marketing Hub"}</strong>
          <small>
            {isChinese
              ? "Carloha Nigeria 车型资料、品牌素材与经销商支持平台。"
              : "Vehicle materials, brand assets & dealer support for Carloha Nigeria."}
          </small>
        </div>
        <div className="footerLinks">
          <span className="footerLabel">{isChinese ? "联系方式" : "Contact"}</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`https://wa.me/${CONTACT.whatsapp.replace(/[\s+]/g, "")}`} target="_blank" rel="noopener noreferrer">
            WhatsApp: {CONTACT.whatsapp}
          </a>
        </div>
      </div>
      <div className="footerBottom">
        <span>{isChinese ? `© ${new Date().getFullYear()} Carloha 版权所有。` : `© ${new Date().getFullYear()} Carloha. All rights reserved.`}</span>
      </div>
    </footer>
  );
}
