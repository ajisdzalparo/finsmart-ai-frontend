import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Check, Lock } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PremiumFeatureCard from './PremiumFeatureCard';

interface AICategorizationFeatureProps {
  className?: string;
}

export default function AICategorizationFeature({
  className = '',
}: AICategorizationFeatureProps) {
  const { hasAccess } = useFeatureAccess();
  const [isProcessing, setIsProcessing] = useState(false);

  const hasAICategorization = hasAccess('ai_categorization', 'premium');

  const sampleTransactions = [
    {
      id: 1,
      description: 'Belanja di Indomaret',
      amount: 50000,
      suggestedCategory: 'Makanan & Minuman',
    },
    {
      id: 2,
      description: 'Bayar listrik PLN',
      amount: 150000,
      suggestedCategory: 'Tagihan',
    },
    {
      id: 3,
      description: 'Ojek online ke kantor',
      amount: 25000,
      suggestedCategory: 'Transportasi',
    },
    {
      id: 4,
      description: 'Kopi di Starbucks',
      amount: 45000,
      suggestedCategory: 'Makanan & Minuman',
    },
  ];

  const handleCategorize = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          AI Kategorisasi Transaksi
        </h2>
        <p className="text-gray-600">
          Otomatis kategorisasi transaksi dengan kecerdasan buatan
        </p>
      </div>

      <PremiumFeatureCard
        feature="ai_categorization"
        title="AI Kategorisasi"
        description="Otomatis kategorisasi transaksi dengan AI"
        requiredPlan="premium"
        icon={<Brain className="h-5 w-5" />}
        benefits={[
          'Kategorisasi otomatis 95% akurat',
          'Belajar dari pola transaksi Anda',
          'Menghemat waktu input manual',
          'Konsistensi kategori yang lebih baik',
        ]}
        className="max-w-4xl mx-auto"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {hasAICategorization ? (
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

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Contoh Kategorisasi AI:</h4>
            <div className="space-y-2">
              {sampleTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {transaction.suggestedCategory}
                    </Badge>
                    {hasAICategorization && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Terima
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Akurasi AI:</label>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: hasAICategorization ? '95%' : '0%' }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {hasAICategorization
                ? '95% akurat berdasarkan data Anda'
                : 'Upgrade untuk mengaktifkan AI'}
            </p>
          </div>

          <Button
            className="w-full"
            disabled={!hasAICategorization || isProcessing}
            onClick={handleCategorize}
            variant={hasAICategorization ? 'default' : 'secondary'}
          >
            {isProcessing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : hasAICategorization ? (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Kategorisasi Otomatis
              </>
            ) : (
              'Upgrade untuk Mengaktifkan'
            )}
          </Button>
        </div>
      </PremiumFeatureCard>

      {/* AI Features Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="text-center p-4">
          <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">AI Insights</h3>
          <p className="text-xs text-gray-600">Analisis pola pengeluaran</p>
          <Badge
            variant={
              hasAccess('ai_insights', 'premium') ? 'default' : 'secondary'
            }
            className="mt-2"
          >
            {hasAccess('ai_insights', 'premium') ? 'Aktif' : 'Premium'}
          </Badge>
        </Card>

        <Card className="text-center p-4">
          <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">AI Kategorisasi</h3>
          <p className="text-xs text-gray-600">
            Otomatis kategorisasi transaksi
          </p>
          <Badge
            variant={hasAICategorization ? 'default' : 'secondary'}
            className="mt-2"
          >
            {hasAICategorization ? 'Aktif' : 'Premium'}
          </Badge>
        </Card>

        <Card className="text-center p-4">
          <Brain className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">AI Rekomendasi</h3>
          <p className="text-xs text-gray-600">Saran keuangan personal</p>
          <Badge
            variant={
              hasAccess('ai_recommendations', 'enterprise')
                ? 'default'
                : 'secondary'
            }
            className="mt-2"
          >
            {hasAccess('ai_recommendations', 'enterprise')
              ? 'Aktif'
              : 'Enterprise'}
          </Badge>
        </Card>
      </div>
    </div>
  );
}
