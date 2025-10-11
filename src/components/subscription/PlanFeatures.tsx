import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface PlanFeaturesProps {
  className?: string;
}

export default function PlanFeatures({ className = '' }: PlanFeaturesProps) {
  const { hasAccess, getPlanFeatures, currentSubscription } =
    useFeatureAccess();
  const features = getPlanFeatures();

  const getPlanIcon = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'free':
        return '🆓';
      case 'premium':
        return '👑';
      case 'enterprise':
        return '💎';
      default:
        return '📦';
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'premium':
        return 'from-blue-500 to-purple-600';
      case 'enterprise':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanIconComponent = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      case 'enterprise':
        return <Zap className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const currentPlanName = currentSubscription?.plan?.name || 'Free';

  const allFeatures = [
    // Free Plan Features
    {
      key: 'basic_transactions',
      name: 'Transaksi Dasar',
      description: 'Pencatatan transaksi harian (max 30)',
      requiredPlan: 'free',
    },
    {
      key: 'basic_categories',
      name: 'Kategori Dasar',
      description: 'Kategori pengeluaran/pemasukan',
      requiredPlan: 'free',
    },
    {
      key: 'basic_goals',
      name: 'Goals Sederhana',
      description: 'Atur tujuan keuangan (max 2)',
      requiredPlan: 'free',
    },
    {
      key: 'basic_reports',
      name: 'Laporan Dasar',
      description: 'Lihat ringkasan laporan keuangan',
      requiredPlan: 'free',
    },

    // Premium Plan Features
    {
      key: 'unlimited_goals',
      name: 'Goals Tanpa Batas',
      description: 'Buat tujuan keuangan tanpa batasan',
      requiredPlan: 'premium',
    },
    {
      key: 'unlimited_transactions',
      name: 'Transaksi Tanpa Batas',
      description: 'Catat transaksi tanpa batasan jumlah',
      requiredPlan: 'premium',
    },
    {
      key: 'unlimited_categories',
      name: 'Kategori Tanpa Batas',
      description: 'Buat kategori tanpa batasan jumlah',
      requiredPlan: 'premium',
    },
    {
      key: 'data_export',
      name: 'Export Data',
      description: 'Ekspor data transaksi ke Excel/CSV',
      requiredPlan: 'premium',
    },
    {
      key: 'goal_reminders',
      name: 'Pengingat Goals',
      description: 'Notifikasi untuk tujuan keuangan',
      requiredPlan: 'premium',
    },
    {
      key: 'budget_alerts',
      name: 'Peringatan Budget',
      description: 'Notifikasi saat mendekati batas budget',
      requiredPlan: 'premium',
    },
    {
      key: 'monthly_insights',
      name: 'Insight dan Rekomendasi Perbulan',
      description: 'Analisis keuangan bulanan dengan rekomendasi',
      requiredPlan: 'premium',
    },
    {
      key: 'generate_reports',
      name: 'Generate Report',
      description: 'Buat laporan keuangan otomatis',
      requiredPlan: 'premium',
    },

    // Enterprise Plan Features
    {
      key: 'advanced_reports',
      name: 'Laporan Lanjutan',
      description: 'Laporan keuangan yang lebih detail',
      requiredPlan: 'enterprise',
    },
    {
      key: 'scheduler',
      name: 'Scheduler',
      description: 'Jadwal otomatis untuk laporan dan transaksi',
      requiredPlan: 'enterprise',
    },
    {
      key: 'ai_chat',
      name: 'AI Chat Assistant',
      description: 'Chat dengan AI untuk konsultasi keuangan personal',
      requiredPlan: 'enterprise',
    },
    {
      key: 'ai_scheduler',
      name: 'AI Scheduler',
      description: 'Jadwal otomatis cerdas untuk laporan dan transaksi',
      requiredPlan: 'enterprise',
    },
    {
      key: 'ai_access',
      name: 'Akses AI',
      description: 'Akses penuh ke fitur AI dan machine learning',
      requiredPlan: 'enterprise',
    },
    {
      key: 'ocr_scan',
      name: 'OCR Scan',
      description: 'Scan struk dan dokumen untuk input otomatis',
      requiredPlan: 'enterprise',
    },
    {
      key: 'custom_insights',
      name: 'Insight dan Rekomendasi Custom',
      description:
        'Insight dan rekomendasi sesuai yang diinginkan berdasarkan scheduler',
      requiredPlan: 'enterprise',
    },
    {
      key: 'export_data_reports',
      name: 'Export Data Report',
      description: 'Export data dan laporan dalam berbagai format',
      requiredPlan: 'enterprise',
    },
  ];

  return (
    <Card
      className={`shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/20 ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div
            className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(
              currentPlanName,
            )} text-white`}
          >
            {getPlanIconComponent(currentPlanName)}
          </div>
          <span>Fitur Paket Anda ({currentPlanName})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFeatures.map((feature) => {
            const userHasAccess = hasAccess(
              feature.key,
              feature.requiredPlan as 'free' | 'premium' | 'enterprise',
            );
            return (
              <div key={feature.key} className="flex items-start space-x-2">
                {userHasAccess ? (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-sm font-medium">{feature.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                  {!userHasAccess && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {feature.requiredPlan === 'premium'
                        ? 'Premium'
                        : 'Enterprise'}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {
                  allFeatures.filter((f) =>
                    hasAccess(
                      f.key,
                      f.requiredPlan as 'free' | 'premium' | 'enterprise',
                    ),
                  ).length
                }
              </div>
              <div className="text-xs text-muted-foreground">
                Fitur Tersedia
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {features.maxTransactions === null
                  ? '∞'
                  : features.maxTransactions}
              </div>
              <div className="text-xs text-muted-foreground">Max Transaksi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {features.maxGoals === null ? '∞' : features.maxGoals}
              </div>
              <div className="text-xs text-muted-foreground">Max Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {features.maxCategories === null ? '∞' : features.maxCategories}
              </div>
              <div className="text-xs text-muted-foreground">Max Kategori</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
