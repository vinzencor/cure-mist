import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QuestionIcon = () => (
  <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M18.5 37C8.27875 37 0 28.7212 0 18.5C0 8.27875 8.27875 0 18.5 0C28.7212 0 37 8.27875 37 18.5C37 28.7212 28.7212 37 18.5 37ZM18.5308 18.5H16.9583V23.125H20.0417V21.3829C22.7087 20.7046 24.6667 18.2842 24.6667 15.4167C24.6667 12.0096 21.9071 9.25 18.5 9.25C15.0929 9.25 12.3333 12.0096 12.3333 15.4167H15.4167C15.4167 13.7208 16.8042 12.3333 18.5 12.3333C20.1958 12.3333 21.5833 13.7208 21.5833 15.4167C21.5833 17.1125 20.2267 18.4846 18.5308 18.5ZM16.9583 27.75H20.0417V24.6667H16.9583V27.75Z" fill="#F2B705" fillOpacity="0.9"/>
  </svg>
);

export default function FAQSection() {
  const faqs = [
    {
      question: "What is Cure Mist?",
      answer: "CureMist is a 100% Ayurvedic patented first aid wound-healing spray designed for quick, touch-free relief from minor cuts, burns, scratches, shoe bites, nail fungus, ringworm and other everyday skin injuries. Any type of open wounds can be healed using Curemist."
    },
    {
      question: "How does Cure Mist work?",
      answer: "CureMist forms our patented clean, protective herbal bio degradable film layer over the skin. Its turmeric,onion extracts and active ingredients has anti-Microbial, anti-Fungal and anti-Inflammatory activities and soothes irritation, reduce redness, and support faster wound recovery. Its clove ingredient works as a local anesthetic, helping in reduced burning and pain feeling. Its Brahmi ingredient helps in active cell regeneration and helps reduce scarring."
    },
    {
      question: "Is Cure Mist safe for all skin types?",
      answer: "Yes. CureMist is made using gentle Ayurvedic ingredients and contains no parabens, sulfates, artificial fragrances, making it safe even for sensitive skin. There are some people who can develop allergy to turmeric or herbal ingredients . Take physician advice in such cases."
    },
    {
      question: "Can women and children use CureMist?",
      answer: "Absolutely. CureMist is safe, gentle, and ideal for women, children, men, elderly and anyone with active lifestyles who needs quick, hygienic wound care"
    },
    {
      question:"Can CureMist be used on the face?",
      answer:"Yes, but avoid spraying near the eyes or mouth. Spray on your fingertips first, then apply gently if needed on facial cuts.",
    },
    {
      question:"Is the spray painful on open wounds?",
      answer:"Relatively yes. CureMist is designed with maximum care to be non-burning and soothing, thanks to its Clove ingredient. But the onion and turmeric ingredients are known to cause very mild pain. But rest assured, healing your wounds is our primary objective.",
    },
    {
      question:"Is CureMist safe for all skin types?",
      answer:"Yes. CureMist is made using gentle Ayurvedic ingredients and contains no parabens, sulfates, artificial fragrances, making it safe even for sensitive skin. There are some people who can develop allergy to turmeric or herbal ingredients . Take physician advice in such cases.",
    },
    {
      question:"What types of wounds can I use CureMist on?",
      answer:"",
    },
    {
      question:"How many times can I apply CureMist in a day?",
      answer:"You can use it 4–5 times daily or whenever needed. It is safe for repeated us",
    },
    {
      question:"Does CureMist have any side effects?",
      answer:"CureMist contains natural ingredients that are generally safe. We have done extensive clinical trails on Human subjects and no side effects were noticed. However, if you are allergic to turmeric,onion,clove,Brahmi and if irritation occurs, discontinue use and consult a doctor.",
    },
    {
      question:"Can I use CureMist during travel?",
      answer:"Yes! The compact spray bottle is travel-friendly, leak-proof, and hygienic, making it perfect for your handbag or first-aid kit.",
    },
    {
      question:"How long does it take to see results?",
      answer:"Most users experience soothing relief instantly, while visible recovery can be seen within 2–3 days depending on the wound.",
    },
    {
      question:"Does CureMist prevent infection?",
      answer:"Yes, the herbal ingredients has natural has anti-Microbial, anti-Fungal properties that help keep the wound area clean.",
    },
    {
      question:"Is CureMist an Ayurvedic product?",
      answer:"Yes. CureMist is formulated based on traditional Ayurvedic ingredients and registered under AYUSH. License no: L-AUS-676",
    },
    {
      question:"How should I store CureMist?",
      answer:"Store in a cool, dry place away from direct sunlight to maintain product effectiveness. The aerosol ingredient makes it flammable.",
    },
    {
      question:"Can CureMist be used with other creams or ointments?",
      answer:"Yes, but apply CureMist first. Let it dry completely before using any other creams.",
    },
    {
      question:"How to use Curemist?",
      answer:""
    },
    {
      question:"What should be done if Curemist gets into eyes",
      answer:"Do not panic. The mild burn is because of the herbal ingredients and is generally safe. Please wash the eyes or sensitive area with normal tap water for few times. If the irritation persists over a long period of time, please consult physician.",
    },
    {
      question:"Does Curemist FFS contain Polyfluoroalkyl substances (PFAS)?",
      answer:"No. CureMist doesn’t contain PFAS.PFAS are often called “forever chemicals” because they do not break down easily. Exposure has been associated with immune system effects, hormonal disruption, and cancer risks in some studies. Their widespread use in consumer products (including adhesives) contributes to environmental contamination.Curemist consist of Acrylic monomer with a carboxylic acid group, not a fluorinated compound. Hence, it is PFAS free and safe to use.",
    },
  ];

  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-12 md:py-20 lg:py-0 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-[34px] font-bold text-black mb-2 md:mb-4">
            FAQ's
          </h2>
          <p className="text-base md:text-xl lg:text-[21px] font-medium text-black max-w-[860px] mx-auto leading-relaxed px-2">
            Have questions about CureMist? Find quick and clear answers to help you understand how our spray works, how to use it, and why it’s the smarter choice for instant first-aid care.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-[1030px] mx-auto">
          <Accordion type="single" collapsible className="space-y-2 md:space-y-4">
            {faqs.slice(0, showAll ? faqs.length : 4).map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-[#DFDFDF] rounded-lg bg-white px-3 md:px-8 py-3 md:py-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-2 md:gap-6 w-full">
                    <div className="flex-shrink-0 hidden md:block">
                      <QuestionIcon />
                    </div>
                    <span className="text-base md:text-xl font-semibold text-black">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 md:pt-4 pl-0 md:pl-16">
                  <p className="text-base md:text-lg font-medium text-black leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* View More/Less Button */}
          {faqs.length > 4 && (
            <div className="flex justify-center lg:mt-6 lg:py-8 md:mt-8">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="bg-[#E4E9FF] hover:bg-[#E4E9FF]/80 text-black px-6 md:px-8 py-2 rounded-md text-sm font-bold transition-colors"
              >
                {showAll ? "VIEW LESS" : "VIEW MORE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
