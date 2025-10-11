import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';

interface FeatureBadgeProps {
  requiredPlan: 'premium' | 'enterprise';
  className?: string;
}

export default function FeatureBadge({
  requiredPlan,
  className = '',
}: FeatureBadgeProps) {
  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: <Crown className="h-3 w-3" />,
          color: 'bg-blue-500 hover:bg-blue-600',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          icon: <Crown className="h-3 w-3" />,
          color: 'bg-purple-500 hover:bg-purple-600',
        };
      default:
        return {
          name: 'Premium',
          icon: <Crown className="h-3 w-3" />,
          color: 'bg-blue-500 hover:bg-blue-600',
        };
    }
  };

  const planInfo = getPlanInfo(requiredPlan);

  return (
    <Badge
      variant="secondary"
      className={`text-xs ${planInfo.color} text-white shadow-sm ${className}`}
    >
      <Lock className="h-3 w-3 mr-1" />
      {planInfo.name}
    </Badge>
  );
}
