import { partners } from "../data/partners";
import { uniqueApplications, uniqueCategories } from "../services/catalog";

interface Props {
  query: string;
  partner: string;
  category: string;
  application: string;
  onChange: (next: { query: string; partner: string; category: string; application: string }) => void;
}

export function ProductFilters({ query, partner, category, application, onChange }: Props) {
  const set = (patch: Partial<Props>) =>
    onChange({
      query,
      partner,
      category,
      application,
      ...patch,
    });

  const field =
    "w-full min-h-[44px] rounded-md border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-teal";

  return (
    <div className="grid gap-3 rounded-xl bg-white p-3 shadow-card sm:p-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-navy/55">Search</span>
        <input
          value={query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Product name or code"
          className={field}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-navy/55">Partner</span>
        <select value={partner} onChange={(e) => set({ partner: e.target.value })} className={field}>
          <option value="all">All Partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-navy/55">Category</span>
        <select value={category} onChange={(e) => set({ category: e.target.value })} className={field}>
          <option value="all">All Categories</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-navy/55">Application</span>
        <select value={application} onChange={(e) => set({ application: e.target.value })} className={field}>
          <option value="all">All Applications</option>
          {uniqueApplications.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
