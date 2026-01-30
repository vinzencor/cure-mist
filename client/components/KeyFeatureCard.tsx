// KeyFeatureCard.js
import React from "react";
// Import React Icons
import { FaCheckCircle, FaHandSparkles, FaLeaf, FaFireAlt, FaUserShield, FaHeartbeat, FaShieldAlt, FaUserMd, FaChild, FaHandsWash } from 'react-icons/fa';
import { MdOutlineHealthAndSafety } from 'react-icons/md';

// Functional component that takes in props: icon and text
const KeyFeatureCard = ({ icon, text, className = "" }) => {
  // Render the correct icon based on the passed "icon" prop
  let IconComponent;

  switch (icon) {
    case 'ayurvedic':
      IconComponent = FaLeaf;
      break;
    case 'derm':
      IconComponent = FaUserMd;
      break;
    case 'safe':
      IconComponent = MdOutlineHealthAndSafety;
      break;
    case 'healing':
      IconComponent = FaHeartbeat;
      break;
    case 'spray':
      IconComponent = FaHandsWash;
      break;
    case 'waterproof':
      IconComponent = FaShieldAlt;
      break;
    case 'antigerm':
      IconComponent = FaUserShield;
      break;
    case 'turmeric':
      IconComponent = FaCheckCircle;
      break;
    case 'ayush':
      IconComponent = FaCheckCircle;
      break;
    case 'ages':
      IconComponent = FaChild;
      break;
    default:
      IconComponent = FaCheckCircle; // Fallback icon
      break;
  }

  return (
    <div className={`feature-card ${className}`.trim()}>
      <IconComponent className="feature-icon" />
      <p className="feature-text">{text}</p>
    </div>
  );
};

export default KeyFeatureCard;