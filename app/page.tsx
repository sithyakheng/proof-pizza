import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TideDivider from "@/components/TideDivider";
import Menu from "@/components/Menu";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import LocationHours from "@/components/LocationHours";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <TideDivider from="#f3ead9" to="#1f3a34" />
        <Menu />
        <TideDivider from="#1f3a34" to="#f3ead9" flip />
        <Gallery />
        <TideDivider from="#f3ead9" to="#1f3a34" />
        <Reviews />
        <TideDivider from="#1f3a34" to="#f3ead9" flip />
        <LocationHours />
        <TideDivider from="#f3ead9" to="#1f3a34" />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
