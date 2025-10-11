import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Check,
  X,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  useCurrentSubscriptionQuery,
  useSubscriptionPlansQuery,
} from '@/api/subscription';
import { useCurrencyFormatter } from '@/lib/currency';

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { data: currentSubscription, isLoading: isLoadingSubscription } =
    useCurrentSubscriptionQuery();
  const { data: availablePlans, isLoading: isLoadingPlans } =
    useSubscriptionPlansQuery();
  const { format } = useCurrencyFormatter();

  if (isLoadingSubscription || isLoadingPlans) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = currentSubscription?.status === 'active';
  const isExpired = currentSubscription?.status === 'expired';
  const isCancelled = currentSubscription?.status === 'cancelled';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'expired':
        return 'Kedaluwarsa';
      case 'cancelled':
        return 'Dibatalkan';
      case 'pending':
        return 'Menunggu';
      default:
        return 'Tidak Diketahui';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanDisplayName = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'Free Plan';
      case 'basic':
        return 'Basic Plan';
      case 'premium':
        return 'Premium Plan';
      case 'pro':
        return 'Pro Plan';
      default:
        return planName;
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return '🆓';
      case 'basic':
        return '⭐';
      case 'premium':
        return '👑';
      case 'pro':
        return '💎';
      default:
        return '📦';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Subscription</span>
          </div>
          {currentSubscription && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  currentSubscription.status,
                )}`}
              ></div>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {getStatusText(currentSubscription.status)}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSubscription ? (
          <>
            {/* Current Plan Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getPlanIcon(currentSubscription.plan.name)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getPlanDisplayName(currentSubscription.plan.name)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.plan.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {format(currentSubscription.plan.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    /
                    {currentSubscription.plan.interval === 'monthly'
                      ? 'bulan'
                      : 'tahun'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Plan Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Fitur yang Tersedia:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {currentSubscription.plan.hasAI ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span>AI Assistant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentSubscription.plan.hasOCR ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span>OCR Upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentSubscription.plan.hasReports ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span>Laporan Detail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentSubscription.plan.hasExport ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span>Export Data</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscription Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Mulai:</span>
                  </div>
                  <span>{formatDate(currentSubscription.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Berakhir:</span>
                  </div>
                  <span>{formatDate(currentSubscription.endDate)}</span>
                </div>
                {currentSubscription.nextBillingDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Pembayaran Selanjutnya:</span>
                    </div>
                    <span>
                      {formatDate(currentSubscription.nextBillingDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Auto Renewal:</span>
                  </div>
                  <span>
                    {currentSubscription.autoRenew ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isActive && (
              <div className="pt-2">
                <Button
                  onClick={onUpgrade}
                  className="w-full"
                  variant={isExpired || isCancelled ? 'default' : 'outline'}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isExpired || isCancelled
                    ? 'Aktifkan Kembali'
                    : 'Upgrade Plan'}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* No Subscription - Free Plan */
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <span className="text-4xl">🆓</span>
              <h3 className="font-semibold text-lg">Free Plan</h3>
              <p className="text-sm text-muted-foreground">
                Anda sedang menggunakan paket gratis dengan fitur terbatas
              </p>
            </div>

            <Separator />

            {/* Free Plan Features */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fitur Gratis:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Transaksi Dasar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Goals Sederhana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-red-500" />
                  <span>AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-red-500" />
                  <span>OCR Upload</span>
                </div>
              </div>
            </div>

            <Separator />

            <Button onClick={onUpgrade} className="w-full">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade ke Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
