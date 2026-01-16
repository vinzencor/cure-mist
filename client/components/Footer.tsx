import { FiPhone, FiMail } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className="bg-brand-yellow py-8 md:py-16 relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Logo and Address */}
          <div>
            <img
              src="/public/Logo.png"
              alt="Cure Mist Logo"
              className="h-[50px] md:h-[62px] w-auto mb-4 md:mb-6"
            />
            <div className="space-y-2">
              <p className="text-base md:text-lg font-extrabold text-black">Altus Pharma</p>
              <p className="text-xs md:text-base font-medium text-black leading-relaxed">
                13/223 B,C ,sukapuram Complex,<br />
                Near Chambaramanam Temple Naduvattom,<br />
                Sugapuram po, Edappal, Kerala 679576
              </p>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block"></div>

          {/* Contact Information */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <a href="tel:+918848815296" className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
              <FiPhone size={16} className="md:w-[18px] md:h-[18px]" />
               </a>
              <a href="tel:+918848815296" className="text-base md:text-lg font-medium text-black">
               +91 88488 15296
               </a>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <a href="mailto:contact@altuspharma.in" className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
               <FiMail size={16} className="md:w-[18px] md:h-[18px]" />
               </a>
               <a href="mailto:contact@altuspharma.in" className="text-base md:text-lg font-medium text-black">
               contact@altuspharma.in
               </a>
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-black mb-2 md:mb-3">Follow us :</p>
              <div className="flex items-center gap-2 md:gap-3">
                <a href="https://www.facebook.com/share/1aPSJ1o8UQ/?mibextid=wwXIfr" className="hover:opacity-80 transition-opacity">
                  <span className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
                    <FaFacebookF size={16} />
                  </span>
                </a>
                <a href="https://www.instagram.com/curemist_official?igsh=YzNqZmtweTR4MWpt&utm_source=qr" className="hover:opacity-80 transition-opacity">
                  <span className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
                    <FaInstagram size={16} />
                  </span>
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <span className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
                    <FaYoutube size={16} />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#BE8F00] mb-6 md:mb-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm md:text-lg font-medium text-black">
            © 2025 Cure Mist. All rights reserved.
          </p>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/918848815296"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 hover:scale-110 transition-transform bg-[#25D366] text-white rounded-full p-2 md:p-3 shadow-lg"
      >
        <FaWhatsapp size={20} className="md:w-[24px] md:h-[24px]" />
      </a>
    </footer>
  );
}
