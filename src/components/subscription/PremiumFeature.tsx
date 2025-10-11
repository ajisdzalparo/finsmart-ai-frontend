import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumTooltip from './PremiumTooltip';
import SubscriptionOverlay from './SubscriptionOverlay';
import { useState } from 'react';

interface PremiumFeatureProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan?: 'premium' | 'enterprise';
  onClick?: () => void;
  className?: string;
  showTooltip?: boolean;
}

export default function PremiumFeature({
  children,
  feature,
  requiredPlan = 'premium',
  onClick,
  className = '',
  showTooltip = true,
}: PremiumFeatureProps) {
  const { canUseFeature } = useSubscription();
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  const hasAccess = canUseFeature(feature);

  const handleClick = () => {
    if (hasAccess && onClick) {
      onClick();
    } else {
      setShowSubscriptionOverlay(true);
    }
  };

  if (hasAccess) {
    return (
      <div onClick={handleClick} className={className}>
        {children}
      </div>
    );
  }

  const content = (
    <div
      onClick={handleClick}
      className={`${className} cursor-pointer relative`}
    >
      {children}
    </div>
  );

  if (showTooltip) {
    return (
      <>
        <PremiumTooltip
          plan={requiredPlan}
          feature={feature}
          onUpgradeClick={() => setShowSubscriptionOverlay(true)}
        >
          {content}
        </PremiumTooltip>

        <SubscriptionOverlay
          isOpen={showSubscriptionOverlay}
          onClose={() => setShowSubscriptionOverlay(false)}
        />
      </>
    );
  }

  return (
    <>
      {content}
      <SubscriptionOverlay
        isOpen={showSubscriptionOverlay}
        onClose={() => setShowSubscriptionOverlay(false)}
      />
    </>
  );
}
