import { Link } from "react-router-dom";
import { applications } from "../../data/applications";
import { categories } from "../../data/categories";
import { company } from "../../data/company";

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="site-container grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-10 lg:py-12">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <img
            src="/assets/logo/smartchem.png"
            alt="SmartChem company logo"
            className="brand-logo brand-logo-footer mb-4"
          />
          <p className="max-w-xs text-sm leading-6 text-white/70">
            High-quality chemical raw materials for coatings, pigments, adhesives and industrial
            applications.
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold tracking-[0.16em] uppercase text-gold">
            Applications
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {applications.slice(0, 6).map((a) => (
              <li key={a.id} className="inline-flex min-h-[36px] items-center">
                {a.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold tracking-[0.16em] uppercase text-gold">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link className="inline-flex min-h-[36px] items-center hover:text-white" to="/about">About Us</Link></li>
            <li><Link className="inline-flex min-h-[36px] items-center hover:text-white" to="/products">Products</Link></li>
            <li><Link className="inline-flex min-h-[36px] items-center hover:text-white" to="/partners">Partners</Link></li>
            <li><Link className="inline-flex min-h-[36px] items-center hover:text-white" to="/applications">Applications</Link></li>
            <li><Link className="inline-flex min-h-[36px] items-center hover:text-white" to="/contact">Contact Us</Link></li>
          </ul>

          <h3 className="mb-3 mt-6 text-sm font-semibold tracking-[0.16em] uppercase text-gold">
            Our Products
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {categories.map((c) => (
              <li key={c.id}>
                <Link className="inline-flex min-h-[36px] items-center hover:text-white" to={`/products/category/${c.id}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold tracking-[0.16em] uppercase text-gold">
            Contact Info
          </h3>
          <ul className="space-y-3 text-sm leading-6 text-white/70">
            <li>
              <a className="hover:text-white" href={`tel:${company.phone.replace(/\s/g, "")}`}>
                {company.phone}
              </a>
            </li>
            <li>
              <a className="break-all hover:text-white" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={company.mapsUrl} target="_blank" rel="noreferrer">
                {company.address}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-2 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SmartChem. All rights reserved.</p>
          <p>{company.tagline}</p>
        </div>
        <div className="site-container pb-5 pt-1 text-center sm:text-left">
          <p className="leading-snug">
            <span className="text-xs text-white/50 sm:text-sm">Crafted by </span>
            <a
              href="https://www.linkedin.com/in/amr-ahmed2025?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold tracking-wide text-white/95 transition-colors hover:text-white hover:underline sm:text-lg"
            >
              AMR KAMAL
            </a>
            <span className="text-sm font-medium text-white/75 sm:text-base"> — RAVENOX</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
