import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';

interface DisabledFeatureProps {
  feature: string;
  requiredPlan: 'premium' | 'enterprise';
  children: React.ReactNode;
  className?: string;
}

export default function DisabledFeature({
  feature,
  requiredPlan,
  children,
  className = '',
}: DisabledFeatureProps) {
  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: '👑',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          icon: '💎',
        };
      default:
        return {
          name: 'Premium',
          icon: '👑',
        };
    }
  };

  const planInfo = getPlanInfo(requiredPlan);

  return (
    <div className={`${className} relative`}>
      {/* Disabled content */}
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* Simple badge di pojok kanan atas */}
      <div className="absolute top-2 right-2 z-10">
        <Badge
          className={`text-xs ${
            requiredPlan === 'premium' ? 'bg-blue-500' : 'bg-purple-500'
          } text-white shadow-sm`}
        >
          <Lock className="h-3 w-3 mr-1" />
          {planInfo.name}
        </Badge>
      </div>
    </div>
  );
}
