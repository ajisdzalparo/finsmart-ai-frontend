/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Star, Crown, Loader2, Sparkles, Zap } from 'lucide-react';
import { useCurrencyFormatter } from '@/lib/currency';
import { paymentService, SubscriptionPlan } from '@/services/payment.service';
import PaymentGateway from '@/components/payment/PaymentGateway';
import {
  SUBSCRIPTION_PLANS,
  getPlanFeatures,
  getPlanIcon,
  getPlanColor,
} from '@/config/subscription-plans';
import { useCurrentSubscriptionQuery } from '@/api/subscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showCurrentPlan?: boolean;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  title = 'Pilih Paket Langganan',
  subtitle = 'Upgrade untuk akses fitur lengkap',
  showCurrentPlan = true,
}: SubscriptionModalProps) {
  const { format } = useCurrencyFormatter();
  const { data: currentSubscription } = useCurrentSubscriptionQuery();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to check if a plan is the current active plan
  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentSubscription || !showCurrentPlan) {
      return false;
    }

    if (currentSubscription.status === 'active') {
      return (
        plan.id === currentSubscription.planId ||
        plan.name.toLowerCase() === currentSubscription.plan.name.toLowerCase()
      );
    }

    return false;
  };

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const availablePlans = await paymentService.getAvailablePlans();
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans(SUBSCRIPTION_PLANS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      onClose();
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setShowPaymentGateway(false);
    onClose();
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan)) {
      return <Badge className="bg-green-100 text-green-800">Paket Aktif</Badge>;
    }
    if (plan.name.toLowerCase() === 'premium') {
      return <Badge className="bg-blue-100 text-blue-800">Populer</Badge>;
    }
    return null;
  };

  const getPlanButtonText = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan)) {
      return 'Paket Aktif';
    }
    return `Pilih ${plan.name}`;
  };

  const getPlanButtonVariant = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan)) {
      return 'outline';
    }
    if (plan.name.toLowerCase() === 'premium') {
      return 'default';
    }
    return 'outline';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
        >
          <Card className="shadow-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative ${
                        plan.name.toLowerCase() === 'premium'
                          ? 'md:scale-105'
                          : ''
                      }`}
                    >
                      <Card
                        className={`h-full ${
                          plan.name.toLowerCase() === 'premium'
                            ? 'border-primary shadow-lg'
                            : 'border-border'
                        }`}
                      >
                        <CardHeader className="text-center pb-4">
                          <div className="flex flex-col items-center space-y-3">
                            {getPlanBadge(plan) && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                {getPlanBadge(plan)}
                              </div>
                            )}

                            <div className="text-4xl">
                              {getPlanIcon(plan.name)}
                            </div>

                            <div>
                              <CardTitle className="text-xl">
                                {plan.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plan.description}
                              </p>
                            </div>

                            <div className="text-center">
                              <div className="text-3xl font-bold text-primary">
                                {format(plan.price)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {plan.price === 0 ? 'Selamanya' : 'per bulan'}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">
                              Fitur Utama:
                            </h4>
                            <div className="space-y-2">
                              {getPlanFeatures(plan)
                                .slice(0, 6)
                                .map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-2"
                                  >
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm">
                                      {feature.name}
                                    </span>
                                  </div>
                                ))}
                              {getPlanFeatures(plan).length > 6 && (
                                <div className="text-sm text-muted-foreground">
                                  +{getPlanFeatures(plan).length - 6} fitur
                                  lainnya
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <Button
                            className="w-full"
                            variant={getPlanButtonVariant(plan)}
                            onClick={() => handleSubscribe(plan)}
                            disabled={isCurrentPlan(plan)}
                          >
                            {getPlanButtonText(plan)}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && selectedPlan && (
        <PaymentGateway
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          plan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
