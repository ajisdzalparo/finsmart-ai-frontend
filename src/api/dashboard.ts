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
  type:
    | 'spending_analysis'
    | 'budget_advice'
    | 'goal_recommendation'
    | 'warning'
    | 'success'
    | 'tip'
    | string;
  title?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
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
  aiGoalGuidance?: Array<{
    goalId: string;
    goalName: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    monthsToGoal: number;
    requiredMonthly: number;
    managementScore: 'excellent' | 'good' | 'needs_improvement';
    remaining: number;
    suggestions: string[];
  }>;
}

export const useDashboardQuery = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return {
        ...data,
        aiGoalGuidance: (data.aiGoalGuidance || []).map((g: any) => ({
          ...g,
          requiredMonthly: Number(g.requiredMonthly),
          remaining: Number(g.remaining),
        })),
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
        insights: (data.insights || []).map((i: any) => ({
          id: i.id,
          type: i.type ?? i.insightType,
          title: i.title ?? i.data?.title,
          message: i.message ?? i.data?.message,
          priority: i.priority,
          data: i.data,
          userId: i.userId,
          generatedAt: i.generatedAt ?? i.createdAt,
        })),
        recommendations: data.recommendations || [],
      };
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
