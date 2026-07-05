export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-end bg-tide overflow-hidden"
    >
      {/* Ambient fire-glow texture instead of a stock photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 75% 30%, rgba(193,122,46,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 15% 80%, rgba(44,79,71,0.6), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #faf6ec 0px, #faf6ec 1px, transparent 1px, transparent 14px)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pb-24 md:pb-32 pt-40 w-full">
        <div className="inline-flex items-center gap-2 bg-cream/10 border border-cream/20 rounded-full px-4 py-1.5 mb-8">
          <span className="text-ochre font-semibold tracking-wide text-sm">★ 5.0</span>
          <span className="text-cream/70 text-sm">· 39 reviews · Kep Beach</span>
        </div>

        <h1 className="font-display italic text-5xl sm:text-6xl md:text-8xl leading-[0.95] text-cream max-w-3xl">
          Wood-fired,
          <br />
          beachside,
          <br />
          unhurried.
        </h1>

        <p className="mt-8 text-cream/75 text-base md:text-lg max-w-md leading-relaxed">
          Proof Pizza Bar &amp; Cafe — fresh pizza from our own wood-fired oven
          and good coffee, steps from the water in Kep, Cambodia.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#menu"
            className="bg-ochre text-cream px-7 py-3.5 rounded-full font-medium tracking-wide hover:bg-ochre/90 transition-colors"
          >
            View Menu
          </a>
          <a
            href="#visit"
            className="border border-cream/40 text-cream px-7 py-3.5 rounded-full font-medium tracking-wide hover:bg-cream/10 transition-colors"
          >
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
