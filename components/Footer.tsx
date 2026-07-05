function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2C16.5 3.1 15.5 3 14.4 3c-2.4 0-4 1.4-4 4.1v2.6H7.7v3.2h2.7V21h3.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/60">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="font-display italic text-2xl text-cream mb-2">Proof</div>
          <p className="text-sm max-w-xs">
            Pizza Bar &amp; Cafe · Kep Beach, Krong Kaeb, Cambodia
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span>076 768 8889</span>
          <span>Open daily · Closes 9 PM</span>
        </div>

        <div className="flex gap-4">
          <a href="#" aria-label="Facebook" className="hover:text-ochre transition-colors">
            <FacebookIcon />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-ochre transition-colors">
            <InstagramIcon />
          </a>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Proof Pizza Bar & Cafe. All rights reserved.
      </div>
    </footer>
  );
}
