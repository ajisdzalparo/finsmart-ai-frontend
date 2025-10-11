import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payment.service';

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: string[];
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscription = async () => {
    try {
      const response = await paymentService.getCurrentSubscription();
      if (response && response.status === 'active') {
        // Transform the response to match our interface
        const transformedSubscription: UserSubscription = {
          id: response.id,
          planId: response.planId,
          planName: response.plan?.name || 'Unknown',
          status: response.status,
          startDate: response.startDate,
          endDate: response.endDate,
          autoRenew: response.autoRenew,
          features: response.plan?.features || [],
        };
        setSubscription(transformedSubscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const hasFeature = (feature: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }
    return subscription.features.includes(feature);
  };

  const isPremium = (): boolean => {
    return (
      subscription?.status === 'active' &&
      ['premium', 'enterprise'].includes(subscription.planName.toLowerCase())
    );
  };

  const isEnterprise = (): boolean => {
    return (
      subscription?.status === 'active' &&
      subscription.planName.toLowerCase() === 'enterprise'
    );
  };

  const canUseFeature = (feature: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    // Check if the feature is included in the plan's features array
    if (subscription.features && subscription.features.includes(feature)) {
      return true;
    }

    // Fallback to plan-based checking
    const featureLimits: Record<string, string[]> = {
      unlimited_transactions: ['premium', 'enterprise'],
      ai_insights: ['premium', 'enterprise'],
      ocr_scan: ['premium', 'enterprise'],
      export_data: ['premium', 'enterprise'],
      multi_user: ['enterprise'],
      api_access: ['enterprise'],
      custom_branding: ['enterprise'],
      dedicated_support: ['enterprise'],
      custom_integrations: ['enterprise'],
    };

    const allowedPlans = featureLimits[feature];
    return allowedPlans
      ? allowedPlans.includes(subscription.planName.toLowerCase())
      : false;
  };

  const getUsageLimit = (feature: string): number => {
    if (!subscription || subscription.status !== 'active') {
      // Free tier limits
      const freeLimits: Record<string, number> = {
        transactions_per_month: 50,
        categories: 10,
        goals: 3,
        ocr_scans_per_month: 5,
        exports_per_month: 2,
      };
      return freeLimits[feature] || 0;
    }

    // Premium tier has unlimited for most features
    const premiumLimits: Record<string, number> = {
      transactions_per_month: -1, // unlimited
      categories: -1,
      goals: -1,
      ocr_scans_per_month: -1,
      exports_per_month: -1,
    };

    return premiumLimits[feature] || -1;
  };

  return {
    subscription,
    isLoading,
    hasFeature,
    isPremium,
    isEnterprise,
    canUseFeature,
    getUsageLimit,
    refreshSubscription: loadSubscription,
  };
}
