// src/components/StatsCard.tsx
// Reusable stats card component with Feather icons

import React from 'react';
import { Camera, Calendar, DollarSign, Folder, Package, Users, TrendingUp, ShoppingCart } from 'react-feather';
import '../styles/StatsCard.css';

// Icon mapping
const iconMap: { [key: string]: React.FC<{ size?: number; color?: string }> } = {
  camera: Camera,
  calendar: Calendar,
  'dollar-sign': DollarSign,
  folder: Folder,
  package: Package,
  users: Users,
  'trending-up': TrendingUp,
  'shopping-cart': ShoppingCart,
};

type IconName = 'camera' | 'calendar' | 'dollar-sign' | 'folder' | 'package' | 'users' | 'trending-up' | 'shopping-cart';
type Variant = 'primary' | 'success' | 'warning' | 'info';

interface StatsCardProps {
  icon: IconName;
  title: string;
  value: number | string;
  variant?: Variant;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, variant = 'primary' }) => {
  const IconComponent = iconMap[icon] || Package;

  return (
    <div className={`stats-card ${variant}`}>
      <div className="stats-icon">
        <IconComponent size={24} />
      </div>
      <div className="stats-content">
        <p className="stats-title">{title}</p>
        <h3 className="stats-value">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
