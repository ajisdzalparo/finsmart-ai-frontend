import { useCurrentSubscriptionQuery } from '@/api/subscription';

// Hook untuk mengecek akses fitur
export function useFeatureAccess() {
  const { data: currentSubscription, isLoading } =
    useCurrentSubscriptionQuery();

  const hasAccess = (
    feature: string,
    requiredPlan: 'free' | 'premium' | 'enterprise' = 'free',
  ) => {
    if (isLoading) return false;

    // Jika tidak ada subscription, anggap sebagai free plan
    if (!currentSubscription || currentSubscription.status !== 'active') {
      // Cek fitur free plan
      const freeFeatures = [
        'basic_transactions',
        'basic_categories',
        'basic_goals',
        'basic_reports',
        'basic_insights',
        'monthly_insights',
      ];
      return freeFeatures.includes(feature);
    }

    // Cek apakah fitur ada dalam array features dari database
    const userFeatures = currentSubscription.plan?.features || [];
    return userFeatures.includes(feature);
  };

  const getPlanFeatures = () => {
    if (!currentSubscription || currentSubscription.status !== 'active') {
      return {
        hasAI: false,
        hasOCR: false,
        hasReports: true,
        hasExport: false,
        hasPrioritySupport: false,
        maxTransactions: 30,
        maxGoals: 2,
        maxCategories: 5, // Free plan: 5 kategori
        features: [
          'basic_transactions',
          'basic_categories',
          'basic_goals',
          'basic_reports',
          'basic_insights',
          'monthly_insights',
        ],
      };
    }

    return {
      hasAI: currentSubscription.plan?.hasAI || false,
      hasOCR: currentSubscription.plan?.hasOCR || false,
      hasReports: currentSubscription.plan?.hasReports || true,
      hasExport: currentSubscription.plan?.hasExport || false,
      hasPrioritySupport: currentSubscription.plan?.hasPrioritySupport || false,
      maxTransactions: currentSubscription.plan?.maxTransactions || null,
      maxGoals: currentSubscription.plan?.maxGoals || null,
      maxCategories: currentSubscription.plan?.maxCategories || null,
      features: currentSubscription.plan?.features || [],
    };
  };

  return {
    hasAccess,
    getPlanFeatures,
    currentSubscription,
    isLoading,
  };
}
