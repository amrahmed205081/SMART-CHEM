import { company } from "../data/company";
import { Button } from "./ui/Button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src="/assets/site/hero.webp"
        alt=""
        width={1672}
        height={941}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />

      <div className="site-container relative z-10 flex min-h-[420px] items-center py-12 sm:min-h-[500px] sm:py-16 md:min-h-[560px] lg:min-h-[620px] lg:py-20">
        <div className="page-enter w-full max-w-xl lg:max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-gold sm:mb-4 sm:tracking-[0.24em]">
            {company.slogan}
          </p>
          <h1 className="text-[2rem] font-bold leading-[1.08] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Smart Chemical <span className="text-brand-light">Solutions</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:mt-6 sm:text-lg sm:leading-8">
            High-quality raw materials for coatings, pigments, adhesives and industrial applications.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-4">
            {company.heroPoints.map((item) => (
              <div key={item} className="border-t border-white/25 pt-2.5 sm:pt-3">
                <p className="text-xs font-medium text-white sm:text-sm">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button to="/products" className="min-h-[44px] w-full justify-center sm:w-auto">
              Explore Products
            </Button>
            <Button to="/contact" variant="outline" className="min-h-[44px] w-full justify-center sm:w-auto">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
