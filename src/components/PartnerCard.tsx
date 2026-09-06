import { Link } from "react-router-dom";
import type { Partner } from "../types";

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Link
      to={`/partners/${partner.id}`}
      className="group block h-auto w-full rounded-card border border-line bg-white p-4 shadow-card transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-teal/35 hover:shadow-lift"
    >
      <div
        className={`flex h-[100px] shrink-0 items-center justify-center overflow-hidden rounded-lg px-4 ${
          partner.logoOnDark ? "bg-brand" : "bg-brand-light"
        }`}
      >
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          className="max-h-14 max-w-[150px] object-contain"
        />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-navy">{partner.name}</h3>
      <p className="mt-1.5 text-sm leading-5 text-ink-muted">{partner.focus}</p>
      <p className="mt-3 text-sm font-semibold text-teal">
        View Partner <span className="inline-block transition group-hover:translate-x-0.5">→</span>
      </p>
    </Link>
  );
}
