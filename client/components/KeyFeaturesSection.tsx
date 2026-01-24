// KeyFeaturesSection.js
import React from "react";
import KeyFeatureCard from "./KeyFeatureCard"; // Importing the KeyFeatureCard component
import './KeyFeatures.css';// Importing the styles

const KeyFeaturesSection = () => {
  const features = [
    { icon: "check", text: "100% Ayurvedic" },
    { icon: "sparkles", text: "Derm Tested Safe!" },
    { icon: "leaf", text: "No side effects" },
    { icon: "heartbeat", text: "Fast Dry Healing" },
    { icon: "fire", text: "Handsfree Spray" },
    { icon: "shield", text: "Water Dust Proof" },
    { icon: "leaf", text: "Anti Germ Healing" },
    { icon: "check", text: "Powered by turmeric" },
    { icon: "heartbeat", text: "Powered by turmeric" },
    { icon: "fire", text: "Anti Germ Healing" },
  ];

  // Responsive grid: 2 rows on desktop, compact grid on mobile
  return (
    <section className="key-features-section premium-section">
      <h2 className="section-title premium-title">Product Highlights</h2>
      <div className="feature-cards-grid">
        {features.map((feature, index) => (
          <KeyFeatureCard key={index} icon={feature.icon} text={feature.text} />
        ))}
      </div>
    </section>
  );
};

export default KeyFeaturesSection;