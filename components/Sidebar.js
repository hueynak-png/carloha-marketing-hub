import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import { CARLOHA_WIKI_URL } from "../lib/config";

const nav = [
  ["/", "Home", "首页"],
  ["/vehicles", "Vehicle Materials", "车型资料"],
  ["/general", "General Materials", "通用资料"],
  ["/updates", "Latest Updates", "最新更新"],
  ["/request", "Q&A / Request", "问题与需求"],
  ["/guidelines", "Usage Guidelines", "使用规范"]
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Image src="/logo.png" width={164} height={51} alt="Carloha logo" priority />
        <span>Marketing Hub</span>
      </Link>
      <LanguageToggle />
      <nav>
        {nav.map(([href, en, cn]) => <Link key={href} href={href}><span className="en">{en}</span><span className="cn">{cn}</span></Link>)}
 <a
  href={CARLOHA_WIKI_URL}
  target="_blank"
  rel="noreferrer"
  className="wiki-link"
>
  Carloha Wiki
</a>
      </nav>
      <section className="sideCard howToUseBox">
        <h3><span className="en">How to Use</span><span className="cn">使用说明</span></h3>
        <ul className="en">
          <li>Use search to find materials by vehicle or category.</li>
          <li>Open vehicle cards to access brochures, photos, videos, and training materials.</li>
          <li>Files are hosted on Google Drive. Access permission may be required.</li>
          <li>Use the request form for new materials or broken links.</li>
        </ul>
        <ul className="cn">
          <li>通过搜索框按车型或资料类型查找文件。</li>
          <li>打开车型卡片查看手册、图片、视频和培训资料。</li>
          <li>资料托管在 Google Drive，部分内容可能需要权限。</li>
          <li>如需新资料或发现链接失效，请提交需求表单。</li>
        </ul>
      </section>
    </aside>
  );
}
