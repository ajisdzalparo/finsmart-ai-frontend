import React from 'react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumTooltip from './PremiumTooltip';
import SubscriptionOverlay from './SubscriptionOverlay';
import { useState } from 'react';

interface PremiumButtonProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan?: 'premium' | 'enterprise';
  onClick?: () => void;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export default function PremiumButton({
  children,
  feature,
  requiredPlan = 'premium',
  onClick,
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
}: PremiumButtonProps) {
  const { canUseFeature } = useSubscription();
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  const hasAccess = canUseFeature(feature);

  const handleClick = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (hasAccess && onClick) {
      onClick();
    } else {
      setShowSubscriptionOverlay(true);
    }
  };

  if (hasAccess) {
    return (
      <Button
        onClick={handleClick}
        className={className}
        variant={variant}
        size={size}
        disabled={false}
      >
        {children}
      </Button>
    );
  }

  return (
    <>
      <PremiumTooltip
        plan={requiredPlan}
        feature={feature}
        onUpgradeClick={() => setShowSubscriptionOverlay(true)}
      >
        <Button
          onClick={handleClick}
          className={`${className} relative`}
          variant={variant}
          size={size}
          disabled={disabled}
        >
          {children}
        </Button>
      </PremiumTooltip>

      <SubscriptionOverlay
        isOpen={showSubscriptionOverlay}
        onClose={() => setShowSubscriptionOverlay(false)}
      />
    </>
  );
}
