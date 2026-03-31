import background from "../../assets/images/ui/background.png";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import LatestArrivals from "../../components/LatestArrivals";
import BestSeller from "../../components/BestSeller";
import Categories from "../../components/Categories";
import Feedbacks from "../../components/Feedbacks";
import Newsletter from "../../components/Newsletter";
import Footer from "../../components/Footer";

function Home() {
  return (
    <div className="bg-black text-white w-full min-h-screen relative overflow-x-hidden">
      {/* Background Image Layer */}
      <img 
        src={background} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none" 
      />
      
      {/* Content Layer overlaying background */}
      <div className="relative z-10 flex flex-col w-full min-h-screen">
        <Navbar />
        <Hero />
        <Categories />
        <BestSeller />
        <LatestArrivals />
        <Feedbacks />
        <Newsletter />
        <Footer />
        
      </div>
    </div>
  );
}

export default Home;