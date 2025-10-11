import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Crown, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useCurrentSubscriptionQuery } from '@/api/subscription';

interface UpgradePromptProps {
  feature: string;
  currentLimit: number;
  maxLimit: number;
  children: React.ReactNode;
}

export default function UpgradePrompt({
  feature,
  currentLimit,
  maxLimit,
  children,
}: UpgradePromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentSubscription } = useCurrentSubscriptionQuery();

  const isFreeUser =
    !currentSubscription ||
    currentSubscription.plan.name.toLowerCase() === 'free';
  const isAtLimit = currentLimit >= maxLimit;

  // Debug logging
  console.log('UpgradePrompt Debug:', {
    feature,
    currentLimit,
    maxLimit,
    isFreeUser,
    isAtLimit,
    shouldShowModal: isFreeUser && isAtLimit,
  });

  // Jika bukan Free user, tampilkan children langsung (unlimited)
  if (!isFreeUser) {
    return <>{children}</>;
  }

  // Jika Free user dan belum mencapai batas, tampilkan children langsung
  if (isFreeUser && !isAtLimit) {
    return <>{children}</>;
  }

  const getFeatureInfo = () => {
    switch (feature) {
      case 'transactions':
        return {
          title: 'Transaksi Unlimited',
          description:
            'Buat transaksi tanpa batas untuk mengelola keuangan Anda',
          icon: '💰',
          current: `${currentLimit}/30 transaksi per bulan`,
        };
      case 'categories':
        return {
          title: 'Kategori Unlimited',
          description:
            'Buat kategori tanpa batas untuk mengorganisir transaksi',
          icon: '🏷️',
          current: `${currentLimit}/5 kategori`,
        };
      case 'goals':
        return {
          title: 'Goals Unlimited',
          description: 'Buat tujuan keuangan tanpa batas untuk mencapai impian',
          icon: '🎯',
          current: `${currentLimit}/2 tujuan`,
        };
      default:
        return {
          title: 'Fitur Premium',
          description: 'Akses fitur premium untuk pengalaman yang lebih baik',
          icon: '⭐',
          current: 'Terbatas',
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          {children}
          {isAtLimit && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 shadow-lg animate-pulse"
            >
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Pilih Paket yang Tepat untuk Anda
          </DialogTitle>
          <DialogDescription>
            Anda telah mencapai batas maksimal untuk fitur ini. Upgrade untuk
            akses unlimited!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{featureInfo.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    {featureInfo.title}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    {featureInfo.current}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-300"
                >
                  Terbatas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Free Plan */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Free</CardTitle>
                <div className="text-2xl font-bold">Rp 0</div>
                <p className="text-sm text-muted-foreground">Selamanya</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30 transaksi/bulan</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>5 kategori</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>2 goals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Laporan dasar</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Paket Saat Ini
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Populer</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Premium</CardTitle>
                <div className="text-2xl font-bold">Rp 49.000</div>
                <p className="text-sm text-muted-foreground">per bulan</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited transaksi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited kategori</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited goals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Export data Excel/CSV</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Insight bulanan</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = '/settings?tab=subscription';
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Pilih Premium
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <div className="text-2xl font-bold">Rp 299.000</div>
                <p className="text-sm text-muted-foreground">per bulan</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Semua fitur Premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI Chat Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI Scheduler</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Scan Nota OCR</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Laporan lanjutan</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = '/settings?tab=subscription';
                  }}
                  variant="outline"
                  className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Pilih Enterprise
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="px-8"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
