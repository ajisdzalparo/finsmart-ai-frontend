/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import api from './api';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  transactionDate: string;
  date: string;
  category: {
    type: string;
    name: string;
  };
  type: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  goalType: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  insightType: string;
  data: Record<string, unknown>;
  userId: string;
  generatedAt: string;
}

export interface Recommendation {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  amount?: number;
}

export interface DashboardData {
  totals: { income: number; expense: number };
  recent: Transaction[];
  goals: Goal[];
  insights: Insight[];
  recommendations: Recommendation[];
}

export const useDashboardQuery = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return {
        ...data,
        recent: data.recent.map((t: any) => ({
          ...t,
          amount: Number(t.amount),
        })),
        goals:
          data.goals?.map((g: any) => ({
            ...g,
            targetAmount: Number(g.targetAmount),
            currentAmount: Number(g.currentAmount),
          })) || [],
        insights: data.insights || [],
        recommendations: data.recommendations || [],
      };
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
