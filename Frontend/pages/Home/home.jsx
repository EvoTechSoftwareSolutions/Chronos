import background from "../../assets/background.png";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import BestSeller from "../../components/BestSeller";
import Categories from "../../components/Categories";

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
        
      </div>
    </div>
  );
}

export default Home;