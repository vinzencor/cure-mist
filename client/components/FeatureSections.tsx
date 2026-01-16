const TurmericIcon = () => (
  <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 22.9706C0.160555 23.0528 1.01816 23.9178 1.17871 24C0.787113 20.4775 2.28302 19.4168 3.85333 19.4521C15.754 19.726 21.2364 9.98043 22 0C18.8515 2.54403 -3.80242 0.571428 0.787113 15.7808C3.5283 9.90998 8.3058 8.37182 14.0271 7.86693C5.94446 9.82779 1.47241 15.0372 0 22.9706Z" fill="#D5A000"/>
  </svg>
);

export default function FeatureSections() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#FFF1C5] via-[#FFE8A0] to-[#EDB200] mt-8 md:mt-0">
      <div className="container mx-auto px-4 md:px-6 lg:px-24 pt-4 md:pt-[90px] pb-0 md:pb-[70px]">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Left Feature Card */}
          <div className="bg-white rounded-lg p-6 md:p-8 lg:p-12 shadow-lg relative">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/e9e9563dd9f6f174b2d9cd188cb54791fb06328b?width=1110"
              alt="Ayurvedic herbs"
              className="w-full h-[200px] md:h-[250px] lg:h-[302px] object-cover rounded-lg mb-6 md:mb-8 -mt-0 md:-mt-32"
            />
            <h3 className="text-2xl md:text-3xl lg:text-[33px] font-extrabold text-black mb-4 md:mb-6 leading-tight tracking-tight">
              World's First Ayurvedic <br />Wound Care Innovation
            </h3>
            <p className="text-base md:text-xl lg:text-[21px] font-medium text-black mb-4 md:mb-6 leading-relaxed">
              A breakthrough in wound care that blends the wisdom of Ayurveda with modern science.
            </p>
            
            <div className="space-y-2 md:space-y-3 mb-6">
              {[
                "100% Ayurvedic | AYUSH Approved",
                "Patented Formula by Indian Scientists",
                "Powered by the natural strength of Turmeric",
                "Dermatologically Tested for safety"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <TurmericIcon />
                  </div>
                  <p className="text-base md:text-lg font-semibold text-black">{feature}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-lg md:text-xl font-bold text-black mb-2">Why it Matters:</h4>
              <p className="text-base md:text-lg font-medium text-black leading-relaxed">
                Traditional healing meets advanced technology to give Indian families a safer, faster, and more reliable first-aid solution.
              </p>
            </div>
          </div>

          {/* Right Feature Card */}
          <div className="bg-white rounded-lg p-6 md:p-8 lg:p-12 shadow-lg relative">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/0263052fb4b49a7116226930f162e800c22bfd7e?width=1110"
              alt="Wound protection"
              className="w-full h-[200px] md:h-[250px] lg:h-[302px] object-cover rounded-lg mb-6 md:mb-8 -mt-0 md:-mt-32"
            />
            <h3 className="text-2xl md:text-3xl lg:text-[33px] font-extrabold text-black mb-4 md:mb-6 leading-tight tracking-tight">
              Advanced Protection. <br />Faster Healing. Zero Hassle.
            </h3>
            <p className="text-base md:text-xl lg:text-[21px] font-medium text-black mb-4 md:mb-6 leading-relaxed">
              Smart Healing Technology Inside.<br />
              Designed for modern lifestyles, Cure Mist works instantly—without touch.
            </p>
            
            <div className="space-y-2 md:space-y-3">
              {[
                { text: "Quick-Drying Technology", sub: "(Dries in under 1 minute)" },
                { text: "Forms a Waterproof & Dustproof", sub: "Protective Film" },
                { text: "Bio-Safe Protective Layer using German", sub: "Technology" },
                { text: "Reduced Scarring Technology, especially", sub: "for burn wounds" },
                { text: "3 Years Medicine Strength before Expiry", sub: "" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <TurmericIcon />
                  </div>
                  <p className="text-base md:text-lg font-semibold text-black leading-tight">
                    {feature.text}{feature.sub && <><br /><span className="font-semibold">{feature.sub}</span></>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
