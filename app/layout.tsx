import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proof Pizza Bar & Cafe | Kep, Cambodia",
  description:
    "Wood-fired pizza and great coffee on Kep Beach. 5.0 stars, 39 reviews. Fresh ingredients, laid-back coastal dining in Krong Kaeb, Cambodia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-sand text-charcoal font-body">
        {children}
      </body>
    </html>
  );
}
