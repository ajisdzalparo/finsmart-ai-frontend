/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/api/api';

export interface PaymentRequest {
  planId: string;
  paymentMethod?: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  token: string;
  status: 'pending' | 'success' | 'failed';
  expiresAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  maxTransactions?: number;
  maxGoals?: number;
  maxCategories?: number;
  hasAI: boolean;
  hasOCR: boolean;
  hasReports: boolean;
  hasExport: boolean;
  hasPrioritySupport: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  nextBillingDate?: string;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  token: string;
  paymentUrl: string;
  expiresAt: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Sending payment request:', request);
      const response = await api.post('/payment/create', request);
      console.log('Payment API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Payment service error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to create payment');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await api.get(`/payment/status/${paymentId}`);
    return response.data;
  }

  async getUserPayments(): Promise<Payment[]> {
    const response = await api.get('/payment/user-payments');
    return response.data;
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/payment/plans');
    return response.data;
  }

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    const response = await api.get('/payment/subscription');
    return response.data;
  }

  async cancelSubscription(): Promise<{ cancelled: boolean }> {
    const response = await api.post('/payment/cancel-subscription');
    return response.data;
  }

  // Helper methods
  formatPrice(price: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getPlanFeatures(plan: SubscriptionPlan): string[] {
    const featureMap: { [key: string]: string } = {
      basic_transactions: 'Transaksi Dasar (50/bulan)',
      unlimited_transactions: 'Transaksi Unlimited',
      basic_categories: 'Kategori Dasar (10 kategori)',
      unlimited_categories: 'Kategori Unlimited',
      basic_goals: 'Target Dasar (3 target)',
      unlimited_goals: 'Target Unlimited',
      ai_insights: 'AI Insights',
      ai_recommendations: 'AI Recommendations',
      ocr_scan: 'Scan Nota OCR',
      basic_reports: 'Laporan Dasar',
      advanced_reports: 'Laporan Advanced',
      data_export: 'Export Data (PDF, Excel)',
      priority_support: 'Priority Support',
      backup_otomatis: 'Backup Otomatis',
      multi_device_sync: 'Multi-device Sync',
      dark_mode: 'Dark Mode',
      multi_user: 'Multi-user (hingga 5 user)',
      team_collaboration: 'Team Collaboration',
      advanced_analytics: 'Advanced AI Analytics',
      custom_integrations: 'Custom Integrations',
      dedicated_support: 'Dedicated Support',
      sla_guarantee: 'SLA Guarantee',
      custom_development: 'Custom Development',
      training_consultation: 'Training & Consultation',
    };

    return plan.features.map((feature) => featureMap[feature] || feature);
  }

  getPlanLimits(plan: SubscriptionPlan): { [key: string]: string | number } {
    const limits: { [key: string]: string | number } = {};

    if (plan.maxTransactions) {
      limits['Transaksi'] = plan.maxTransactions;
    } else {
      limits['Transaksi'] = 'Unlimited';
    }

    if (plan.maxGoals) {
      limits['Target'] = plan.maxGoals;
    } else {
      limits['Target'] = 'Unlimited';
    }

    if (plan.maxCategories) {
      limits['Kategori'] = plan.maxCategories;
    } else {
      limits['Kategori'] = 'Unlimited';
    }

    return limits;
  }

  isFeatureIncluded(plan: SubscriptionPlan, feature: string): boolean {
    return plan.features.includes(feature);
  }

  getPlanBadgeColor(planName: string): string {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPlanGradient(planName: string): string {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'from-gray-400 to-gray-600';
      case 'premium':
        return 'from-blue-500 to-blue-600';
      case 'enterprise':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  }
}

export const paymentService = new PaymentService();
