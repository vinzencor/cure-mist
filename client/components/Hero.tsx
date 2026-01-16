import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Array of banners with image URL, title, description, and button text
const BANNERS = [
  {
    image: "/banners/banner1.png",  // First banner image
    title: "CureMist - Ayurvedic First Aid Wound Spray",
    description: "Safe for all ages | AYUSH Certified |\n Patented Formula",
    buttonText: "Shop Now",
  },
  {
    image: "/banners/banner2.png",  // Second banner image
    title: "Trusted by Over 500 + Families for Everyday Healing",
    description: "From Kids Scrapes \nto daily first aid needs",
    buttonText: "Shop Now",
  },
  {
    image: "/banners/banner3.png",  // Third banner image
    title: "Small Wounds Can Happen Anytime.",
    description: "Curemist Combo Pack \nBuy 2 & save More",
    buttonText: "Shop Now",
  },
];

export default function Hero() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Automatically change the banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Navigate to previous banner
  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  // Navigate to next banner
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  };

  // Function to change to a specific banner
  const goToBanner = (index: number) => {
    setCurrentBanner(index);
  };

  return (
    <section className="relative mt-0 md:mt-0 min-h-[50vh] md:h-[650px] overflow-hidden">
      {/* Carousel Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {BANNERS.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image for Left Side */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${banner.image})`,
                objectFit: "cover",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: "100%", // Ensures the banner image covers the container height
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 md:px-6 lg:px-24 h-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 md:gap-4 h-full items-center py-8 md:py-0">
          {/* Left Content (Remains the Same for All Banners) */}
          <div className="space-y-4 md:space-y-6 pt-4 md:pt-12 lg:pt-0">
            <h1 className="text-3xl md:text-xl sm:text-4xl lg:text-5xl font-bold text-brand-blue leading-tight">
              {BANNERS[currentBanner].title}
            </h1>
            <h3 className="text-sm sm:text-lg md:text-xl lg:text-3xl font-medium text-black mx-auto">
              {BANNERS[currentBanner].description}
            </h3>

            <button 
                 onClick={() => {
                 document.getElementById("products")?.scrollIntoView({
                 behavior: "smooth",
              });
              }}
            className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-6 md:px-12 py-3 md:py-4 rounded-lg text-base md:text-lg font-extrabold transition-colors">
              {BANNERS[currentBanner].buttonText}
            </button>

            {/* Badges */}
            <div className="flex items-center gap-2 sm:gap-4 pt-2 md:pt-4">
              <img
                src="/banners/element1.png"
                alt="AYUSH Badge"
                className="h-[30px] sm:h-[35px] md:h-[51px] w-auto"
              />
              <img
                src="/banners/element2.png"
                alt="Certification Badge"
                className="h-[30px] sm:h-[35px] md:h-[51px] w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevBanner}
        className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg text-brand-blue transition-all hover:scale-110"
        aria-label="Previous Banner"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextBanner}
        className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg text-brand-blue transition-all hover:scale-110"
        aria-label="Next Banner"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToBanner(index)}
            className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
              index === currentBanner
                ? "bg-brand-blue w-8 md:w-10"
                : "bg-brand-blue/40 w-2 md:w-3 hover:bg-brand-blue/60"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
