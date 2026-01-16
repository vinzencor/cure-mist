import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import FeatureSections from "@/components/FeatureSections";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <main className="pt-[110px] md:pt-[100px]">
      <Hero />
      <ProductSection />
      <FeatureSections />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
      </main>
    </div>
  );
}
