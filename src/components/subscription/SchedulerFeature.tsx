import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Crown, Lock, Check, X } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PremiumFeatureCard from './PremiumFeatureCard';

interface SchedulerFeatureProps {
  className?: string;
}

export default function SchedulerFeature({
  className = '',
}: SchedulerFeatureProps) {
  const { hasAccess } = useFeatureAccess();
  const [selectedFrequency, setSelectedFrequency] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('monthly');

  const hasDailyAccess = hasAccess('scheduler_daily', 'enterprise');
  const hasWeeklyAccess = hasAccess('scheduler_weekly', 'enterprise');
  const hasMonthlyAccess = hasAccess('scheduler_monthly', 'premium');
  const hasYearlyAccess = hasAccess('scheduler_yearly', 'enterprise');
  const hasAdvancedScheduler = hasAccess('advanced_scheduler', 'enterprise');

  const schedulerOptions = [
    {
      key: 'monthly',
      name: 'Laporan Bulanan',
      description: 'Kirim laporan keuangan bulanan via email',
      icon: <Calendar className="h-5 w-5" />,
      requiredPlan: 'premium' as const,
      hasAccess: hasMonthlyAccess,
      benefits: ['Email laporan bulanan', 'PDF export', 'Custom tanggal kirim'],
    },
    {
      key: 'daily',
      name: 'Reminder Harian',
      description: 'Pengingat harian untuk input transaksi',
      icon: <Clock className="h-5 w-5" />,
      requiredPlan: 'enterprise' as const,
      hasAccess: hasDailyAccess,
      benefits: ['Notifikasi harian', 'Custom waktu', 'Push notification'],
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Scheduler & Automation
        </h2>
        <p className="text-gray-600">
          Atur jadwal otomatis untuk transaksi dan laporan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedulerOptions.map((option) => (
          <PremiumFeatureCard
            key={option.key}
            feature={`scheduler_${option.key}`}
            title={option.name}
            description={option.description}
            requiredPlan={option.requiredPlan}
            icon={option.icon}
            benefits={option.benefits}
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {option.hasAccess ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100">
                    <Lock className="h-3 w-3 mr-1" />
                    Terkunci
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Waktu Kirim:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  disabled={!option.hasAccess}
                >
                  <option value="09:00">09:00 WIB</option>
                  <option value="18:00">18:00 WIB</option>
                  <option value="21:00">21:00 WIB</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notifikasi:</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      disabled={!option.hasAccess}
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      disabled={!option.hasAccess}
                    />
                    <span className="text-sm">Push Notification</span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!option.hasAccess}
                variant={option.hasAccess ? 'default' : 'secondary'}
              >
                {option.hasAccess ? 'Aktifkan' : 'Upgrade untuk Mengaktifkan'}
              </Button>
            </div>
          </PremiumFeatureCard>
        ))}
      </div>
    </div>
  );
}
