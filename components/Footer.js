import Link from "next/link";
import { CONTACT } from "../lib/config";

export default function Footer() {
  return (
    <footer className="globalFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <strong className="en">Carloha Marketing Hub</strong>
          <strong className="cn">Carloha 营销资料中心</strong>
          <small className="en">Vehicle materials, brand assets &amp; dealer support for Carloha Nigeria.</small>
          <small className="cn">Carloha Nigeria 车型资料、品牌素材与经销商支持平台。</small>
        </div>
        <div className="footerLinks">
          <span className="footerLabel en">Quick Links</span>
          <span className="footerLabel cn">快速链接</span>
          <Link href="/">Home</Link>
          <Link href="/vehicles">Vehicles</Link>
          <Link href="/general">General Materials</Link>
          <Link href="/request">Request</Link>
          <Link href="/guidelines">Guidelines</Link>
        </div>
        <div className="footerLinks">
          <span className="footerLabel en">Contact</span>
          <span className="footerLabel cn">联系方式</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`https://wa.me/${CONTACT.whatsapp.replace(/[\s+]/g, "")}`} target="_blank" rel="noopener noreferrer">
            WhatsApp: {CONTACT.whatsapp}
          </a>
        </div>
      </div>
      <div className="footerBottom">
        <span className="en">&copy; {new Date().getFullYear()} Carloha. All rights reserved.</span>
        <span className="cn">&copy; {new Date().getFullYear()} Carloha 版权所有。</span>
      </div>
    </footer>
  );
}
