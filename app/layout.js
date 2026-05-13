import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Carloha Marketing Hub",
  description: "Vehicle materials, brand assets, and dealer marketing support."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="appShell">
          <Sidebar />
          <main className="mainContent">{children}</main>
        </div>
      </body>
    </html>
  );
}
