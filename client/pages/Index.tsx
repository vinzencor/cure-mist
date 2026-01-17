import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import FeatureSections from "@/components/FeatureSections";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("welcome") === "true") {
      setShowWelcome(true);
      // Clean up the URL
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[110px] md:pt-[100px]">
        <Hero />
        <ProductSection />
        <FeatureSections />
        <StatsSection />
        <TestimonialsSection />
        <FAQSection />
        <Footer />
      </main>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <DialogTitle className="text-2xl text-center">Welcome to Curemist!</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              Your email has been verified successfully. We are thrilled to have you with us.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-brand-yellow/10 p-4 rounded-lg mt-4">
            <p className="text-brand-blue font-semibold">Enjoy 5% off on all orders automatically!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
