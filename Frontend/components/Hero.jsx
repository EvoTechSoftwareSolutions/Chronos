import React, { useState, useEffect } from 'react';
import heroBg from '../assets/images/hero/hero-bg.png';

function Hero() {
  const [targetDate, setTargetDate] = useState(() => {
    return new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000));
  });

  const [timeLeft, setTimeLeft] = useState({ days: '03', hours: '10' });

  // Carousel Data
  const watches = [
    {
      id: 1,
      image: "../assets/images/hero/Heroimg1.png",
      imagePlaceholder: "Watch 1 Image",
      badgePrefix: "LATEST",
      badgeSuffix: "ARRIVAL",
      title: "Rolex Luxury Watch"
    },
    {
      id: 2,
      image: "../assets/images/hero/heroimage2.png",
      imagePlaceholder: "Watch 2 Image",
      badgePrefix: "POPULAR",
      badgeSuffix: "WATCH",
      title: "HK Smart Watch"
    },
    {
      id: 3,
      image: "../assets/images/hero/heroimage3.png",
      imagePlaceholder: "Watch 3 Image",
      badgePrefix: "BEST",
      badgeSuffix: "SELLING",
      title: "Omega Dive Watch"
    }
  ];

  const [currentWatch, setCurrentWatch] = useState(0);

  const nextWatch = () => setCurrentWatch((prev) => (prev + 1) % watches.length);
  const prevWatch = () => setCurrentWatch((prev) => (prev - 1 + watches.length) % watches.length);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')
        });
      } else {
        setTargetDate(new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section 
      id="hero-watches"
      className="relative flex-1 flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 py-12 pb-24 min-h-screen pt-32 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Left Output */}
      <div className="w-full lg:w-[55%] flex flex-col z-10 pr-0 lg:pr-10 relative">
        <h3 className="text-[#D4AF37] font-playfair tracking-[0.25em] text-sm font-semibold mb-6 uppercase">
          Chronos
        </h3>
        <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-playfair font-normal leading-[1.1] mb-8 drop-shadow-lg">
          <span className="text-white block">PRECISION THAT</span>
          <span className="text-[#D4AF37] inline-block mr-4">DeFINES</span>
          <span className="text-white inline-block">TIME</span>
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-xl font-light">
          Where centuries of watchmaking tradition meets contemporary design. Each timepiece is a testament to human mastery.
        </p>
        
        <div className="mb-14">
          <button className="bg-[#D4AF37] text-black px-8 py-3.5 rounded-lg font-bold hover:bg-yellow-400 transition transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 text-[15px]">
            Shop Now 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Feature Icons */}
        <div className="flex flex-wrap gap-8 items-center text-sm font-light text-gray-300">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#D4AF37" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-medium text-[13px]">Secure Payment</span>
              <span className="text-[10px] text-gray-400">256-bit SSL encryption</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#D4AF37" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-medium text-[13px]">Free Delivery</span>
              <span className="text-[10px] text-gray-400">Upto $500</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#D4AF37" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-medium text-[13px]">Trusted Company</span>
              <span className="text-[10px] text-gray-400">100% Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Watch & Offset Content */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between h-full relative mt-16 lg:mt-10 z-10 pl-0">
        
        {/* Watch Image Cluster */}
        <div className="relative flex items-center justify-center w-full min-h-[400px] mt-10">
          {/* Arrow Left */}
          <button 
            onClick={prevWatch}
            className="absolute left-0 lg:left-35 z-20 w-10 h-10 rounded-full border border-gray-500/50 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition cursor-pointer bg-black/10 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          {/* The Watch image Container (Transparent Floating Style) */}
          <div className="w-64 h-96 relative flex items-center justify-center transition-all duration-500">
            {watches[currentWatch].image ? (
              <img src={watches[currentWatch].image} alt="Watch" className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.2] lg:scale-[1.4]" />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center rounded-xl bg-black/10 backdrop-blur-sm">
                <span className="text-[#D4AF37] text-xs tracking-widest uppercase opacity-60 text-center px-4">
                  + Add {watches[currentWatch].imagePlaceholder}
                </span>
              </div>
            )}
          </div>

          {/* Arrow Right */}
          <button 
            onClick={nextWatch}
            className="absolute right-30 lg:-left--20 z-20 w-10 h-10 rounded-full border border-gray-500/50 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition cursor-pointer bg-black/10 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Glassmorphism Badge */}
          <div className="absolute right-30 bottom-4 lg:-bottom-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 px-4 py-3 rounded-lg shadow-2xl z-20">
            <h4 className="text-white text-xs font-playfair font-bold tracking-widest mb-0.5 flex items-center gap-1.5">
              <span className="opacity-90">{watches[currentWatch].badgePrefix}</span> <span className="text-[#D4AF37] opacity-90">{watches[currentWatch].badgeSuffix}</span>
            </h4>
            <p className="text-white/80 text-[10px]">{watches[currentWatch].title}</p>
          </div>
        </div>

        {/* Limited Time Offer Section (No Backplate) */}
        <div className="mt-20 lg:mt-16 self-start lg:self-end text-left pr-0 lg:pr-10 relative z-20">
          <h4 className="text-[#D4AF37] font-playfair text-[12px] tracking-[0.25em] font-bold mb-3 uppercase">Limited Time Offer</h4>
          <h2 className="text-4xl lg:text-5xl font-playfair font-normal text-white mb-2 leading-tight">
            UP TO <span className="text-[#D4AF37]">40%</span> OFF
          </h2>
          <p className="text-gray-300 text-[11px] leading-relaxed mb-6 font-light max-w-[280px]">
            Discover our exclusive Spring collection with unprecedented savings on select luxury timepieces.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs font-light">Offer Ends In :</span>
            <div className="flex items-center text-sm gap-2">
              <div className="bg-[#0b0b0b] border border-gray-800 px-2.5 py-1 rounded font-mono font-bold text-white text-center shadow-inner">{timeLeft.days}</div>
              <span className="text-[#D4AF37] font-playfair font-bold text-[12px] tracking-widest pl-0">DAYS</span>
              
              <div className="bg-[#0b0b0b] border border-gray-800 px-2.5 py-1 rounded font-mono font-bold text-white text-center shadow-inner ml-2">{timeLeft.hours}</div>
              <span className="text-[#D4AF37] font-playfair font-bold text-[12px] tracking-widest pl-0">HOURS</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}

export default Hero;
