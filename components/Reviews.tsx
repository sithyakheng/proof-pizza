const reviews = [
  {
    name: "Manju",
    text: "One of the coolest, well designed, detailed restaurants. Small space but greater value to detail.",
    guide: "Local Guide · 317 reviews",
  },
  {
    name: "Faith Joy",
    text: "Delivers exactly the kind of laid-back coastal dining experience you hope to find in Kep — unpretentious, welcoming, and genuinely satisfying.",
    guide: "Local Guide · 23 reviews",
  },
  {
    name: "David Phelan",
    text: "Easily the best pizza we've had since coming to Southeast Asia, and fantastic coffee to go with it. Their own pizza oven, freshest ingredients.",
    guide: "6 photos",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="bg-tide">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
              What people say
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-cream mt-4">
              Reviews
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl text-ochre">5.0</span>
            <div className="text-cream/60 text-sm leading-tight">
              ★★★★★
              <br />
              39 Google reviews
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-cream/5 border border-cream/10 rounded-2xl p-7"
            >
              <div className="text-ochre mb-4 tracking-wide">★★★★★</div>
              <p className="text-cream/80 leading-relaxed text-sm">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-6 text-cream text-sm font-medium">{r.name}</div>
              <div className="text-cream/45 text-xs">{r.guide}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
