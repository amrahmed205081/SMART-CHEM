interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="page-header">
      <div className="site-container relative z-10 py-10 sm:py-12 lg:py-14">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-gold sm:mb-3 sm:tracking-[0.22em]">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold break-words text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:mt-4 sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
