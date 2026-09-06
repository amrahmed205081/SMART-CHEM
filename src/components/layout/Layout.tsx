import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { RouteLoader } from "../RouteLoader";
import { GlobalJsonLd } from "../../seo/GlobalJsonLd";

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <GlobalJsonLd />
      <RouteLoader />
      <Navbar />
      <main className="w-full flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
