import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TideDivider from "@/components/TideDivider";
import Menu from "@/components/Menu";
import Reviews from "@/components/Reviews";
import LocationHours from "@/components/LocationHours";
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
        <Reviews />
        <TideDivider from="#1f3a34" to="#f3ead9" flip />
        <LocationHours />
      </main>
      <Footer />
    </>
  );
}
