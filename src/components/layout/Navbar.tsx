import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/applications", label: "Applications" },
  { to: "/partners", label: "Partners" },
  { to: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--nav-height",
          `${headerRef.current.offsetHeight}px`,
        );
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md"
      >
        <div className="site-container flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3 lg:py-3.5">
          <Link
            to="/"
            className="flex min-h-[44px] shrink-0 items-center"
            onClick={() => setOpen(false)}
          >
            <img
              src="/assets/logo/smartchem.webp"
              alt="SmartChem — Smart Chemical Solutions"
              className="h-[56px] w-auto object-contain xs:h-[60px] sm:h-[66px] lg:h-[74px]"
            />
          </Link>

          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `nav-link text-sm font-medium tracking-wide ${
                    isActive ? "active text-brand" : "text-ink-muted hover:text-brand"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/contact"
              className="hidden min-h-[44px] items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal sm:inline-flex"
            >
              Get a Quote
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-brand lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        <div className={`mobile-nav-panel border-t border-line bg-white lg:hidden ${open ? "is-open" : ""}`}>
          <div className="site-container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-md px-3 text-base ${
                    isActive ? "bg-brand-light font-semibold text-brand" : "text-ink-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white sm:hidden"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </header>

      <div
        className={`mobile-nav-backdrop lg:hidden ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
