import { MapPin, Phone, Clock } from "lucide-react";

export default function LocationHours() {
  return (
    <section id="visit" className="bg-sand">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12">
        <div>
          <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
            Find us
          </span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 mb-8">
            Visit Proof
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="text-clay shrink-0 mt-1" size={22} />
              <div>
                <div className="font-medium">Kep Beach, Krong Kaeb</div>
                <div className="text-charcoal/60 text-sm">Cambodia · F7HV+X7</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="text-clay shrink-0 mt-1" size={22} />
              <div>
                <div className="font-medium">076 768 8889</div>
                <div className="text-charcoal/60 text-sm">Call for reservations</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="text-clay shrink-0 mt-1" size={22} />
              <div>
                <div className="font-medium">Open daily</div>
                <div className="text-charcoal/60 text-sm">Closes 9 PM</div>
              </div>
            </div>
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Proof+Pizza+Bar+Cafe+Kep+Cambodia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 bg-tide text-cream px-7 py-3.5 rounded-full font-medium tracking-wide hover:bg-tide-light transition-colors"
          >
            Get Directions
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-charcoal/10 min-h-[320px]">
          <iframe
            title="Proof Pizza Bar & Cafe location"
            width="100%"
            height="100%"
            style={{ minHeight: 320, border: 0 }}
            loading="lazy"
            src="https://www.google.com/maps?q=Proof+Pizza+Bar+Cafe+Kep+Beach+Cambodia&output=embed"
          />
        </div>
      </div>
    </section>
  );
}
