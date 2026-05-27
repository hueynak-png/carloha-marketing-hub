import "./globals.css";
import AppShell from "../components/AppShell";
import PageTracker from "../components/PageTracker";
import LangSync from "../components/LangSync";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://carloha-marketing-hub.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Carloha Marketing Hub — Vehicle Materials & Dealer Marketing Support",
    template: "%s | Carloha Marketing Hub",
  },
  description: "Vehicle materials, brand assets, and dealer marketing support for Carloha Nigeria. Browse Chery brochures, photos, training materials, and more.",
  keywords: ["Carloha", "Chery", "Nigeria", "Tiggo", "SUV", "marketing", "dealer", "vehicle materials", "brochure"],
  openGraph: {
    title: "Carloha Marketing Hub",
    description: "Vehicle materials, brand assets, and dealer marketing support for Carloha Nigeria.",
    url: siteUrl,
    siteName: "Carloha Marketing Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carloha Marketing Hub",
    description: "Vehicle materials, brand assets, and dealer marketing support for Carloha Nigeria.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangSync />
        <PageTracker />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
