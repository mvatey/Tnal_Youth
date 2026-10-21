import Header from "./Header";
import Hero from "./Hero";
import Gallery from "./Gallery";
import ActivitySection from "./ActivitySection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#15194b]">
      <Header />

      {/* The sideways clip is kept off the header's ancestors: any overflow
          rule on a parent stops a sticky header from sticking in some
          (mobile) browsers. */}
      <div className="overflow-x-clip">
        <main>
          <Hero />
          <Gallery />
          <ActivitySection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
