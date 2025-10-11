import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PremiumBadge from './PremiumBadge';

interface PremiumTooltipProps {
  children: React.ReactNode;
  plan: 'premium' | 'enterprise';
  feature: string;
  onUpgradeClick?: () => void;
}

export default function PremiumTooltip({
  children,
  plan,
  feature,
  onUpgradeClick,
}: PremiumTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <div className="absolute -top-1 -right-1">
              <PremiumBadge plan={plan} size="sm" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PremiumBadge plan={plan} size="sm" />
              <span className="font-medium">Fitur Premium</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {feature} memerlukan paket {plan} untuk mengaksesnya.
            </p>
            {onUpgradeClick && (
              <button
                onClick={onUpgradeClick}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Upgrade sekarang
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
