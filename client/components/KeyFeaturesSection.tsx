// KeyFeaturesSection.js
import React from "react";
import KeyFeatureCard from "./KeyFeatureCard"; // Importing the KeyFeatureCard component
import './KeyFeatures.css';// Importing the styles

const KeyFeaturesSection = () => {
  const features = [
    { icon: "check", text: "World’s 1st Ayurvedic Wound Spray" },
    { icon: "sparkles", text: "100% Ayurvedic | AYUSH Approved" },
    { icon: "leaf", text: "Safe for all ages – infants to elders" },
    { icon: "heartbeat", text: "No side effects | Dermatologically tested" },
    { icon: "fire", text: "Fast-acting & quick-drying (under 1 min)" },
    { icon: "shield", text: "Hands-free, easy-to-use spray" },
    { icon: "leaf", text: "Waterproof & dust-proof protective layer" },
    { icon: "check", text: "Anti-bacterial, anti-fungal & anti-inflammatory" },
    { icon: "heartbeat", text: "Powered by turmeric" },
    { icon: "fire", text: "Effective for cuts, burns, wounds & skin infections" },
  ];

  // Split features into 2 rows, each with 5 features
  const rows = [features.slice(0, 5), features.slice(5, 10)];

  return (
    <section className="key-features-section premium-section">
      <h2 className="section-title premium-title">Product Highlights</h2>
      <div className="feature-rows-container">
        {rows.map((row, rowIndex) => (
          <div className="feature-cards-row" key={rowIndex}>
            {row.map((feature, index) => (
              <KeyFeatureCard key={index} icon={feature.icon} text={feature.text} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyFeaturesSection;