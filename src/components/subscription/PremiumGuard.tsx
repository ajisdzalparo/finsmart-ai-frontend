import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionOverlay from './SubscriptionOverlay';
import { useState } from 'react';

interface PremiumGuardProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan?: 'premium' | 'pro' | 'enterprise';
  fallback?: React.ReactNode;
  onUpgradeClick?: () => void;
}

export default function PremiumGuard({
  children,
  feature,
  requiredPlan = 'premium',
  fallback,
  onUpgradeClick,
}: PremiumGuardProps) {
  const { canUseFeature } = useSubscription();
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (onUpgradeClick) {
    return (
      <div onClick={onUpgradeClick} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setShowSubscriptionOverlay(true)}
        className="cursor-pointer"
      >
        {children}
      </div>
      <SubscriptionOverlay
        isOpen={showSubscriptionOverlay}
        onClose={() => setShowSubscriptionOverlay(false)}
      />
    </>
  );
}
