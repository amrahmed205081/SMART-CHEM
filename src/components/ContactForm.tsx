import { useState, type FormEvent } from "react";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message") || "").trim();
    const next: Record<string, string> = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email.";
    if (company.length < 2) next.company = "Please enter your company name.";
    if (message.length < 8) next.message = "Please add a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSent(true);
    e.currentTarget.reset();
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-cream p-8">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-teal">Message received</p>
        <h3 className="mt-2 text-2xl font-semibold text-navy">Thank you for contacting SmartChem.</h3>
        <p className="mt-3 text-sm leading-6 text-navy/70">
          This is a frontend demonstration. Your details were validated locally and were not sent to a server.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-md bg-teal px-4 py-2.5 text-sm font-semibold text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field = "w-full min-h-[44px] rounded-md border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-teal";

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${compact ? "" : ""}`} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-navy/70">Your Name</span>
          <input name="name" className={field} />
          {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-navy/70">Your Email</span>
          <input name="email" type="email" className={field} />
          {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm text-navy/70">Company Name</span>
        <input name="company" className={field} />
        {errors.company && <p className="mt-1 text-xs text-red-700">{errors.company}</p>}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-navy/70">Your Message</span>
        <textarea name="message" rows={5} className={field} />
        {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message}</p>}
      </label>
      <button type="submit" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-teal px-6 py-3 text-sm font-semibold text-white hover:bg-teal-soft sm:w-auto">
        Send Message
      </button>
    </form>
  );
}
