"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const standaloneRoutes = new Set(["/chinese-dealer-brochure"]);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isStandalone = standaloneRoutes.has(pathname);

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="appShell">
      <Sidebar />
      <main className="mainContent">
        {children}
        <Footer />
      </main>
    </div>
  );
}
