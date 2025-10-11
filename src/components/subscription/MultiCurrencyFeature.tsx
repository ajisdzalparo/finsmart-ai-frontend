import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Check, Lock, Globe } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PremiumFeatureCard from './PremiumFeatureCard';

interface MultiCurrencyFeatureProps {
  className?: string;
}

export default function MultiCurrencyFeature({
  className = '',
}: MultiCurrencyFeatureProps) {
  const { hasAccess } = useFeatureAccess();
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [exchangeRate, setExchangeRate] = useState(1);

  const hasMultiCurrency = hasAccess('multiple_currencies', 'premium');

  const currencies = [
    { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp', rate: 1 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 15000 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 16500 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 11000 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 100 },
  ];

  const sampleTransactions = [
    { description: 'Belanja di Indomaret', amount: 50000, currency: 'IDR' },
    { description: 'Netflix Subscription', amount: 15, currency: 'USD' },
    { description: 'Coffee at Starbucks', amount: 45, currency: 'SGD' },
    { description: 'Bayar listrik', amount: 150000, currency: 'IDR' },
  ];

  const formatAmount = (amount: number, currency: string) => {
    const curr = currencies.find((c) => c.code === currency);
    if (!curr) return `${amount}`;

    const convertedAmount = currency === 'IDR' ? amount : amount * curr.rate;
    return `${curr.symbol} ${convertedAmount.toLocaleString()}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Multi Mata Uang</h2>
        <p className="text-gray-600">
          Kelola transaksi dalam berbagai mata uang dengan konversi otomatis
        </p>
      </div>

      <PremiumFeatureCard
        feature="multiple_currencies"
        title="Multi Mata Uang"
        description="Kelola transaksi dalam berbagai mata uang"
        requiredPlan="premium"
        icon={<Globe className="h-5 w-5" />}
        benefits={[
          'Support 5+ mata uang',
          'Konversi otomatis ke Rupiah',
          'Tampilan multi-currency',
          'Update kurs real-time',
        ]}
        className="max-w-4xl mx-auto"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {hasMultiCurrency ? (
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
            <h4 className="font-medium text-sm">Mata Uang yang Didukung:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {currencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`p-2 rounded-lg border text-center ${
                    selectedCurrency === currency.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm">{currency.symbol}</div>
                  <div className="text-xs text-gray-600">{currency.code}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Contoh Transaksi Multi-Currency:
            </h4>
            <div className="space-y-2">
              {sampleTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {transaction.currency}
                    </Badge>
                    {transaction.currency !== 'IDR' && (
                      <span className="text-xs text-gray-500">
                        = {formatAmount(transaction.amount, 'IDR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mata Uang Default:</label>
            <Select
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
              disabled={!hasMultiCurrency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mata uang default" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Kurs Hari Ini:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>1 USD = Rp 15.000</div>
              <div>1 EUR = Rp 16.500</div>
              <div>1 SGD = Rp 11.000</div>
              <div>1 JPY = Rp 100</div>
            </div>
          </div>
        </div>
      </PremiumFeatureCard>
    </div>
  );
}
