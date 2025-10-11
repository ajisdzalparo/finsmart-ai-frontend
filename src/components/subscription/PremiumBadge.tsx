import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown } from 'lucide-react';

interface PremiumBadgeProps {
  plan: 'premium' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const planIcons = {
  premium: <Star className="h-3 w-3" />,
  enterprise: <Crown className="h-3 w-3" />,
};

const planColors = {
  premium: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  enterprise: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
};

export default function PremiumBadge({
  plan,
  size = 'sm',
  className = '',
}: PremiumBadgeProps) {
  return (
    <Badge
      className={`${planColors[plan]} ${sizeClasses[size]} ${className} flex items-center gap-1`}
    >
      {planIcons[plan]}
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </Badge>
  );
}
