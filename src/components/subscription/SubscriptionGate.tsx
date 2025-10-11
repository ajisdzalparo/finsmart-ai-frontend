import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Zap, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionOverlay from './SubscriptionOverlay';
import { useState } from 'react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan?: 'premium' | 'pro' | 'enterprise';
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const planIcons = {
  premium: <Star className="h-4 w-4" />,
  pro: <Zap className="h-4 w-4" />,
  enterprise: <Crown className="h-4 w-4" />,
};

const planColors = {
  premium: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-amber-600',
};

export default function SubscriptionGate({
  children,
  feature,
  requiredPlan = 'premium',
  fallback,
  showUpgrade = true,
}: SubscriptionGateProps) {
  const { canUseFeature, subscription } = useSubscription();
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <>
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center pb-4">
          <div
            className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${planColors[requiredPlan]} flex items-center justify-center text-white mb-4`}
          >
            {planIcons[requiredPlan]}
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Fitur Premium
          </CardTitle>
          <Badge variant="secondary" className="w-fit mx-auto">
            {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}{' '}
            Required
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Fitur ini memerlukan paket {requiredPlan} untuk mengaksesnya.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => setShowSubscriptionOverlay(true)}
              className={`w-full bg-gradient-to-r ${planColors[requiredPlan]} hover:opacity-90`}
            >
              Upgrade ke{' '}
              {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </Button>
            <p className="text-xs text-muted-foreground">
              Mulai dari Rp 99.000/bulan • Gratis 7 hari trial
            </p>
          </div>
        </CardContent>
      </Card>

      <SubscriptionOverlay
        isOpen={showSubscriptionOverlay}
        onClose={() => setShowSubscriptionOverlay(false)}
      />
    </>
  );
}
