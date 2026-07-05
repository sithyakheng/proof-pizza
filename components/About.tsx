export default function About() {
  return (
    <section id="about" className="bg-sand">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20 items-start">
        <div>
          <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
            Our story
          </span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">
            Small space,
            <br />
            greater value to detail.
          </h2>
        </div>

        <div className="space-y-5 text-charcoal/80 leading-relaxed">
          <p>
            Proof sits right on Kep Beach, built around a single wood-fired
            oven and a simple idea: make the dough properly, use what&apos;s
            fresh that day, and don&apos;t rush anyone out the door.
          </p>
          <p>
            Every pizza gets fired to order — blistered crust, real
            mozzarella, herbs and toppings sourced as locally as Kep allows.
            Pair it with a pour-over or a cold drink and watch the tide come
            in.
          </p>
          <p>
            It&apos;s an easy, unpretentious kind of place — the sort of spot
            regulars keep coming back to, and first-timers wish they&apos;d
            found sooner.
          </p>

          <div className="flex gap-10 pt-4">
            <div>
              <div className="font-display text-3xl text-clay">5.0</div>
              <div className="text-xs uppercase tracking-wide text-charcoal/50 mt-1">
                Average rating
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-clay">39</div>
              <div className="text-xs uppercase tracking-wide text-charcoal/50 mt-1">
                Reviews
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-clay">1</div>
              <div className="text-xs uppercase tracking-wide text-charcoal/50 mt-1">
                Wood-fired oven
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
