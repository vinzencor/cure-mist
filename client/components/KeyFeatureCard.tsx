// KeyFeatureCard.js
import React from "react";
// Import React Icons
import { FaCheckCircle, FaHandSparkles, FaLeaf, FaFireAlt, FaUserShield, FaHeartbeat } from 'react-icons/fa'; // You can import any icon you want

// Functional component that takes in props: icon and text
const KeyFeatureCard = ({ icon, text }) => {
  // Render the correct icon based on the passed "icon" prop
  let IconComponent;

  switch (icon) {
    case 'check':
      IconComponent = FaCheckCircle;
      break;
    case 'sparkles':
      IconComponent = FaHandSparkles;
      break;
    case 'leaf':
      IconComponent = FaLeaf;
      break;
    case 'fire':
      IconComponent = FaFireAlt;
      break;
    case 'shield':
      IconComponent = FaUserShield;
      break;
    case 'heartbeat':
      IconComponent = FaHeartbeat;
      break;
    default:
      IconComponent = FaCheckCircle; // Fallback icon
      break;
  }

  return (
    <div className="feature-card">
      <IconComponent className="feature-icon" />
      <p className="feature-text">{text}</p>
    </div>
  );
};

export default KeyFeatureCard;