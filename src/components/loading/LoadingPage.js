import Header from "./Header";
import Hero from "./Hero";
import Gallery from "./Gallery";
import ActivitySection from "./ActivitySection";
import Footer from "./Footer";


export default function LoadingPage(){

  return (

    <div
      className="
      min-h-screen
      bg-white
      text-[#15194b]
      "
    >

      <Header />


      <main>

        <Hero />

        <Gallery />

        <ActivitySection />

      </main>


      <Footer />


    </div>

  );

}