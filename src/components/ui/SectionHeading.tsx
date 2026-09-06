interface Props {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  light,
}: Props) {
  return (
    <div className={`mb-8 max-w-3xl md:mb-10 ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className={`mb-2 text-xs font-semibold tracking-[0.2em] uppercase sm:mb-3 sm:tracking-[0.22em] ${light ? "text-gold" : "text-teal"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-2xl font-bold leading-tight sm:text-3xl md:text-4xl ${light ? "text-white" : "text-navy"}`}>
        {title}{" "}
        {accent && <span className={light ? "text-brand-light" : "text-teal"}>{accent}</span>}
      </h2>
      {description && (
        <p className={`mt-3 text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7 ${light ? "text-white/75" : "text-ink-muted"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
