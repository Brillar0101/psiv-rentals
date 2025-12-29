// src/components/StatsCard.tsx
// Reusable stats card component

import React from 'react';
import '../styles/StatsCard.css';

interface StatsCardProps {
  icon: string;
  title: string;
  value: number | string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, color = '#007bff' }) => {
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-icon" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
