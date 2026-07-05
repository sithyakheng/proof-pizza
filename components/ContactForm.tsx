"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const { error } = await supabase.from("contact_messages").insert([payload]);
      if (error) throw error;
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-tide">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
          Get in touch
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-cream mt-4 mb-10">
          Send a message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <input
              name="name"
              required
              placeholder="Your name"
              className="bg-cream/5 border border-cream/20 rounded-lg px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-ochre"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="bg-cream/5 border border-cream/20 rounded-lg px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-ochre"
            />
          </div>
          <input
            name="phone"
            placeholder="Phone (optional)"
            className="w-full bg-cream/5 border border-cream/20 rounded-lg px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-ochre"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Your message"
            className="w-full bg-cream/5 border border-cream/20 rounded-lg px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-ochre"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-ochre text-cream px-8 py-3.5 rounded-full font-medium tracking-wide hover:bg-ochre/90 transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          {status === "success" && (
            <p className="text-sm text-green-400">
              Thanks — your message has been sent. We&apos;ll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-clay">
              Something went wrong sending your message. Please try again or call us directly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
