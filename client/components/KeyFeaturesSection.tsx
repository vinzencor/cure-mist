// KeyFeaturesSection.js
import React from "react";
import KeyFeatureCard from "./KeyFeatureCard"; // Importing the KeyFeatureCard component
import './KeyFeatures.css';// Importing the styles

const KeyFeaturesSection = () => {
  const features = [
    { icon: "ayurvedic", text: "100% Ayurvedic" },
    { icon: "derm", text: "Derm Tested Safe!" },
    { icon: "safe", text: "No side effects" },
    { icon: "healing", text: "Fast Dry Healing" },
    { icon: "spray", text: "Handsfree Spray" },
    { icon: "waterproof", text: "Water Dust Proof" },
    { icon: "antigerm", text: "Anti Germ Healing" },
    { icon: "turmeric", text: "Powered by turmeric" },
    { icon: "ayush", text: "AYUSH Approved" },
    { icon: "ages", text: "Safe for all ages" },
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