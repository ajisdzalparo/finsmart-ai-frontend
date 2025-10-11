import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Star,
  Zap,
  Calendar,
  CreditCard,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCurrencyFormatter } from '@/lib/currency';
import SubscriptionOverlay from './SubscriptionOverlay';

const planIcons = {
  premium: <Star className="h-5 w-5" />,
  pro: <Zap className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
};

const planColors = {
  premium: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-amber-600',
};

const statusIcons = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <AlertCircle className="h-4 w-4 text-orange-500" />,
  expired: <AlertCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-orange-100 text-orange-800 border-orange-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function SubscriptionStatus() {
  const { subscription, isLoading } = useSubscription();
  const { format } = useCurrencyFormatter();
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Status Langganan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Paket Gratis</h3>
            <p className="text-muted-foreground mb-4">
              Anda sedang menggunakan paket gratis dengan fitur terbatas.
            </p>
            <Button
              onClick={() => setShowSubscriptionOverlay(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Upgrade Sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planIcon = planIcons[subscription.planId as keyof typeof planIcons] || (
    <Star className="h-5 w-5" />
  );
  const planColor =
    planColors[subscription.planId as keyof typeof planColors] ||
    'from-gray-500 to-gray-600';
  const statusIcon = statusIcons[subscription.status];
  const statusColor = statusColors[subscription.status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {planIcon}
            {subscription.planName}
            <Badge className={statusColor}>
              {statusIcon}
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Mulai</span>
              </div>
              <p className="font-medium">
                {formatDate(subscription.startDate)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Berakhir</span>
              </div>
              <p className="font-medium">{formatDate(subscription.endDate)}</p>
            </div>
          </div>

          {subscription.status === 'active' && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {daysRemaining > 0
                    ? `${daysRemaining} hari tersisa`
                    : 'Berakhir hari ini'}
                </span>
              </div>
            </div>
          )}

          {subscription.status === 'cancelled' && (
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Langganan dibatalkan, aktif hingga{' '}
                  {formatDate(subscription.endDate)}
                </span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Fitur yang aktif:</h4>
            <div className="grid grid-cols-2 gap-2">
              {subscription.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
              {subscription.features.length > 6 && (
                <div className="col-span-2 text-sm text-muted-foreground">
                  +{subscription.features.length - 6} fitur lainnya
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Kelola
            </Button>
            {subscription.status !== 'active' && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => setShowSubscriptionOverlay(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Perpanjang
              </Button>
            )}
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
