import { useQuery } from '@tanstack/react-query';
import api from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string; // monthly, yearly
  features: string[];
  maxTransactions?: number; // null = unlimited
  maxGoals?: number; // null = unlimited
  maxCategories?: number; // null = unlimited
  hasAI: boolean;
  hasOCR: boolean;
  hasReports: boolean;
  hasExport: boolean;
  hasPrioritySupport: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
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

export const useSubscriptionPlansQuery = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await api.get('/payment/plans');
      return response.data;
    },
  });
};

export const useCurrentSubscriptionQuery = () => {
  return useQuery<UserSubscription | null>({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const response = await api.get('/payment/subscription');
      return response.data;
    },
  });
};
