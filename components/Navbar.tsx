"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#menu", label: "Menu" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#visit", label: "Visit" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-tide/95 backdrop-blur shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 py-4">
        <a href="/" className="font-display italic text-xl md:text-2xl text-cream tracking-wide">
          Proof
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-cream/85 hover:text-ochre transition-colors tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/order"
            className="bg-ochre text-cream px-5 py-2.5 rounded-full font-medium text-sm tracking-wide hover:bg-ochre/90 transition-colors"
          >
            Order Now
          </a>
        </div>

        <button
          className="md:hidden text-cream"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-tide px-5 pb-5 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-cream/90 text-sm"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/order"
            onClick={() => setOpen(false)}
            className="bg-ochre text-cream px-5 py-2.5 rounded-full font-medium text-sm tracking-wide text-center hover:bg-ochre/90 transition-colors"
          >
            Order Now
          </a>
        </div>
      )}
    </header>
  );
}
