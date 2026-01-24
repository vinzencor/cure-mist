// KeyFeaturesSection.js
import React from "react";
import KeyFeatureCard from "./KeyFeatureCard"; // Importing the KeyFeatureCard component
import './KeyFeatures.css';// Importing the styles

const KeyFeaturesSection = () => {
  const features = [
    { icon: "check", text: "Dermatologically tested" },
    { icon: "sparkles", text: "No side effects" },
    { icon: "leaf", text: "Safe for all ages – infants to elders" },
    { icon: "heartbeat", text: "World’s 1st Ayurvedic Wound Spray" },
    { icon: "fire", text: "Fast-acting & quick-drying (under 1 min)" },
    { icon: "shield", text: "Hands-free, easy-to-use spray" },
    { icon: "leaf", text: "Waterproof & dustproof" },
    { icon: "check", text: "Powered by turmeric" },
    { icon: "heartbeat", text: "Anti-bacterial, anti-fungal & anti-inflammatory" },
    { icon: "fire", text: "Effective for cuts, burns, wounds & skin infections" },
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