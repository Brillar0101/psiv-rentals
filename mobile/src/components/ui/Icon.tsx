// src/components/ui/Icon.tsx
// Centralized Icon component using Feather icons
// Professional, consistent icon styling throughout the app

import React from 'react';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

// Define all icon names used in the app
export type IconName =
  // Navigation
  | 'home'
  | 'search'
  | 'calendar'
  | 'shopping-cart'
  | 'user'
  | 'menu'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'x'
  // Actions
  | 'plus'
  | 'minus'
  | 'edit'
  | 'edit-2'
  | 'trash-2'
  | 'share'
  | 'share-2'
  | 'copy'
  | 'download'
  | 'upload'
  | 'refresh-cw'
  | 'filter'
  | 'settings'
  | 'log-out'
  | 'log-in'
  | 'external-link'
  // Status
  | 'check'
  | 'check-circle'
  | 'x-circle'
  | 'alert-circle'
  | 'alert-triangle'
  | 'info'
  | 'clock'
  | 'loader'
  // Content
  | 'heart'
  | 'star'
  | 'bookmark'
  | 'eye'
  | 'eye-off'
  | 'image'
  | 'camera'
  | 'video'
  | 'film'
  | 'mic'
  | 'headphones'
  | 'speaker'
  // Objects
  | 'package'
  | 'box'
  | 'gift'
  | 'tag'
  | 'credit-card'
  | 'dollar-sign'
  | 'percent'
  | 'shopping-bag'
  // Communication
  | 'mail'
  | 'message-circle'
  | 'message-square'
  | 'phone'
  | 'send'
  | 'bell'
  | 'bell-off'
  // Location & Weather
  | 'map-pin'
  | 'map'
  | 'navigation'
  | 'compass'
  | 'sun'
  | 'moon'
  | 'cloud'
  // Tech
  | 'wifi'
  | 'wifi-off'
  | 'bluetooth'
  | 'battery'
  | 'monitor'
  | 'smartphone'
  | 'hard-drive'
  | 'cpu'
  | 'cloud-off'
  | 'tool'
  | 'inbox'
  // Misc
  | 'aperture'
  | 'maximize'
  | 'minimize'
  | 'move'
  | 'grid'
  | 'list'
  | 'layers'
  | 'sliders'
  | 'award'
  | 'zap'
  | 'shield'
  | 'lock'
  | 'unlock'
  | 'key'
  | 'help-circle'
  | 'file'
  | 'file-text'
  | 'folder'
  | 'clipboard'
  | 'thumbs-up'
  | 'thumbs-down';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = SIZES.icon,
  color = COLORS.text,
  style,
}) => {
  return (
    <Feather
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
};

// Preset icon components for common use cases
export const HomeIcon: React.FC<{ size?: number; color?: string; focused?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  focused 
}) => (
  <Icon 
    name="home" 
    size={size} 
    color={color || (focused ? COLORS.primary : COLORS.textLight)} 
  />
);

export const SearchIcon: React.FC<{ size?: number; color?: string; focused?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  focused 
}) => (
  <Icon 
    name="search" 
    size={size} 
    color={color || (focused ? COLORS.primary : COLORS.textLight)} 
  />
);

export const BookingsIcon: React.FC<{ size?: number; color?: string; focused?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  focused 
}) => (
  <Icon 
    name="calendar" 
    size={size} 
    color={color || (focused ? COLORS.primary : COLORS.textLight)} 
  />
);

export const CartIcon: React.FC<{ size?: number; color?: string; focused?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  focused 
}) => (
  <Icon 
    name="shopping-cart" 
    size={size} 
    color={color || (focused ? COLORS.primary : COLORS.textLight)} 
  />
);

export const ProfileIcon: React.FC<{ size?: number; color?: string; focused?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  focused 
}) => (
  <Icon 
    name="user" 
    size={size} 
    color={color || (focused ? COLORS.primary : COLORS.textLight)} 
  />
);

export const BackIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.text 
}) => (
  <Icon name="arrow-left" size={size} color={color} />
);

export const CloseIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.textSecondary 
}) => (
  <Icon name="x" size={size} color={color} />
);

export const HeartIcon: React.FC<{ size?: number; color?: string; filled?: boolean }> = ({ 
  size = SIZES.icon, 
  color = COLORS.text,
  filled 
}) => (
  <Icon name="heart" size={size} color={filled ? COLORS.error : color} />
);

export const StarIcon: React.FC<{ size?: number; color?: string; filled?: boolean }> = ({ 
  size = SIZES.icon, 
  color,
  filled 
}) => (
  <Icon name="star" size={size} color={filled ? COLORS.accent : (color || COLORS.textLight)} />
);

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.success 
}) => (
  <Icon name="check" size={size} color={color} />
);

export const CheckCircleIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.success 
}) => (
  <Icon name="check-circle" size={size} color={color} />
);

export const ClockIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.warning 
}) => (
  <Icon name="clock" size={size} color={color} />
);

export const AlertIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.error 
}) => (
  <Icon name="alert-circle" size={size} color={color} />
);

export const InfoIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = SIZES.icon, 
  color = COLORS.info 
}) => (
  <Icon name="info" size={size} color={color} />
);

// Category icon helper
export const getCategoryIcon = (categoryName: string): IconName => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('camera')) return 'camera';
  if (name.includes('lens')) return 'aperture';
  if (name.includes('audio') || name.includes('sound')) return 'headphones';
  if (name.includes('light')) return 'sun';
  if (name.includes('accessory') || name.includes('accessories')) return 'package';
  if (name.includes('drone')) return 'navigation';
  if (name.includes('tripod')) return 'maximize';
  if (name.includes('stabilizer') || name.includes('gimbal')) return 'move';
  if (name.includes('monitor') || name.includes('display')) return 'monitor';
  if (name.includes('storage') || name.includes('memory')) return 'hard-drive';
  if (name.includes('video')) return 'video';
  if (name.includes('mic')) return 'mic';
  
  return 'box';
};

export default Icon;
