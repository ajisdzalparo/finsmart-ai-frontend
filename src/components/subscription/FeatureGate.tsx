import React, { useState } from 'react';
import { useCurrentSubscriptionQuery } from '@/api/subscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Check, X } from 'lucide-react';
import SubscriptionPopup from './SubscriptionPopup';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan?: 'free' | 'premium' | 'enterprise';
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function FeatureGate({
  children,
  feature,
  requiredPlan = 'free',
  fallback,
  showUpgradeButton = true,
  className = '',
  disabled = false,
}: FeatureGateProps) {
  const { data: currentSubscription, isLoading } =
    useCurrentSubscriptionQuery();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  // Jika loading, tampilkan children
  if (isLoading) {
    return <div className={className}>{children}</div>;
  }

  // Jika tidak ada subscription, anggap sebagai free plan
  const userPlan = currentSubscription?.plan?.name?.toLowerCase() || 'free';
  const isActive = currentSubscription?.status === 'active';

  // Mapping plan hierarchy
  const planHierarchy = {
    free: 0,
    premium: 1,
    enterprise: 2,
  };

  const userPlanLevel =
    planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan];

  // Check if user has access to the feature
  const hasAccess = isActive && userPlanLevel >= requiredPlanLevel;

  // Jika user memiliki akses, tampilkan children
  if (hasAccess && !disabled) {
    return <div className={className}>{children}</div>;
  }

  // Jika tidak memiliki akses, tampilkan fallback atau upgrade prompt
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default upgrade prompt
  const getUpgradeMessage = () => {
    switch (requiredPlan) {
      case 'premium':
        return 'Fitur ini memerlukan paket Premium';
      case 'enterprise':
        return 'Fitur ini memerlukan paket Enterprise';
      default:
        return 'Fitur ini tidak tersedia';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return '👑';
      case 'enterprise':
        return '💎';
      default:
        return '🆓';
    }
  };

  return (
    <div className={`${className} relative`}>
      {/* Jika user memiliki akses, tampilkan children normal */}
      {hasAccess && !disabled ? (
        <div className="relative">{children}</div>
      ) : (
        /* Jika tidak memiliki akses, tampilkan disabled state yang sederhana */
        <div className="relative">
          {/* Disabled content dengan opacity */}
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
              {requiredPlan === 'premium' ? 'Premium' : 'Enterprise'}
            </Badge>
          </div>
        </div>
      )}

      {/* Subscription popup - hanya muncul saat tombol upgrade diklik */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />
    </div>
  );
}
