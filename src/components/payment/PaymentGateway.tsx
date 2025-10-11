/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Store,
  Loader2,
  Check,
  X,
  ArrowLeft,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';
import { useCurrencyFormatter } from '@/lib/currency';
import { paymentService, SubscriptionPlan } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fees: number;
  processingTime: string;
  available: boolean;
  category: 'card' | 'ewallet' | 'bank' | 'retail' | 'qris';
}

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onPaymentSuccess: (paymentData: any) => void;
}

export default function PaymentGateway({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
}: PaymentGatewayProps) {
  const { format } = useCurrencyFormatter();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'processing' | 'success'>(
    'method',
  );

  const paymentMethods: PaymentMethod[] = [
    // Credit Cards
    {
      id: 'credit_card',
      name: 'Kartu Kredit/Debit',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, JCB',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'card',
    },

    // E-Wallets
    {
      id: 'gopay',
      name: 'GoPay',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Bayar dengan saldo GoPay',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'ewallet',
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Bayar dengan saldo OVO',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'ewallet',
    },
    {
      id: 'dana',
      name: 'DANA',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Bayar dengan saldo DANA',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'ewallet',
    },
    {
      id: 'linkaja',
      name: 'LinkAja',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Bayar dengan saldo LinkAja',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'ewallet',
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Bayar dengan saldo ShopeePay',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'ewallet',
    },

    // Virtual Accounts
    {
      id: 'permata_va',
      name: 'Permata Virtual Account',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Transfer ke Virtual Account Permata',
      fees: 0,
      processingTime: '1-5 menit',
      available: true,
      category: 'bank',
    },
    {
      id: 'bca_va',
      name: 'BCA Virtual Account',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Transfer ke Virtual Account BCA',
      fees: 0,
      processingTime: '1-5 menit',
      available: true,
      category: 'bank',
    },
    {
      id: 'bni_va',
      name: 'BNI Virtual Account',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Transfer ke Virtual Account BNI',
      fees: 0,
      processingTime: '1-5 menit',
      available: true,
      category: 'bank',
    },
    {
      id: 'bri_va',
      name: 'BRI Virtual Account',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Transfer ke Virtual Account BRI',
      fees: 0,
      processingTime: '1-5 menit',
      available: true,
      category: 'bank',
    },
    {
      id: 'mandiri_va',
      name: 'Mandiri Virtual Account',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Transfer ke Virtual Account Mandiri',
      fees: 0,
      processingTime: '1-5 menit',
      available: true,
      category: 'bank',
    },

    // QRIS
    {
      id: 'qris',
      name: 'QRIS',
      icon: <QrCode className="h-5 w-5" />,
      description: 'Scan QR Code dengan aplikasi bank/e-wallet',
      fees: 0,
      processingTime: 'Instan',
      available: true,
      category: 'qris',
    },

    // Retail Outlets
    {
      id: 'indomaret',
      name: 'Indomaret',
      icon: <Store className="h-5 w-5" />,
      description: 'Bayar di gerai Indomaret terdekat',
      fees: 0,
      processingTime: '24 jam',
      available: true,
      category: 'retail',
    },
    {
      id: 'alfamart',
      name: 'Alfamart',
      icon: <Store className="h-5 w-5" />,
      description: 'Bayar di gerai Alfamart terdekat',
      fees: 0,
      processingTime: '24 jam',
      available: true,
      category: 'retail',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ewallet':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bank':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'qris':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'retail':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'card':
        return 'Kartu';
      case 'ewallet':
        return 'E-Wallet';
      case 'bank':
        return 'Bank Transfer';
      case 'qris':
        return 'QRIS';
      case 'retail':
        return 'Retail';
      default:
        return 'Lainnya';
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Error',
        description: 'Pilih metode pembayaran terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      console.log(
        'Creating payment for plan:',
        plan.id,
        'with method:',
        selectedMethod.id,
      );

      const paymentRequest = {
        planId: plan.id,
        paymentMethod: selectedMethod.id,
      };

      const paymentResult = await paymentService.createPayment(paymentRequest);

      console.log('Payment response:', paymentResult);

      if (paymentResult.paymentUrl) {
        toast({
          title: 'Pembayaran Dibuat!',
          description: 'Anda akan diarahkan ke halaman pembayaran',
        });

        // Open payment URL in new tab
        window.open(paymentResult.paymentUrl, '_blank');

        onPaymentSuccess(paymentResult);
        onClose();
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Pembayaran Gagal',
        description:
          error.message || 'Terjadi kesalahan saat memproses pembayaran',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Pilih Metode Pembayaran
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Bayar untuk {plan.name} Plan
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Plan Summary */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{plan.name} Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {format(plan.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per {plan.interval}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Metode Pembayaran</h3>

                    {Object.entries(groupedMethods).map(
                      ([category, methods]) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(category)}>
                              {getCategoryName(category)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {methods.length} metode tersedia
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {methods.map((method) => (
                              <motion.div
                                key={method.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                  selectedMethod?.id === method.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                } ${
                                  !method.available
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                onClick={() =>
                                  method.available && setSelectedMethod(method)
                                }
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {method.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-sm">
                                        {method.name}
                                      </h4>
                                      {selectedMethod?.id === method.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {method.description}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {method.processingTime}
                                        </span>
                                      </div>
                                      {method.fees === 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Zap className="h-3 w-3 text-green-500" />
                                          <span className="text-xs text-green-600">
                                            Gratis
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                      Batal
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={!selectedMethod || isProcessing}
                      className="min-w-[120px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Lanjutkan'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Memproses Pembayaran
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Mohon tunggu sebentar...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
