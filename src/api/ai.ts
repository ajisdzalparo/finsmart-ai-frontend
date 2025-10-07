/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface AIInsight {
  id: string;
  type:
    | 'spending_analysis'
    | 'goal_recommendation'
    | 'budget_advice'
    | 'investment_advice';
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  generatedAt: string;
}

export interface AIRecommendation {
  id: string;
  type:
    | 'spending_optimization'
    | 'savings_improvement'
    | 'goal_acceleration'
    | 'investment_advice';
  title: string;
  message: string;
  amount?: number;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export interface AIDashboard {
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  statistics: {
    totalInsights: number;
    totalRecommendations: number;
    unreadRecommendations: number;
  };
}

export const aiApi = {
  // Get AI insights
  getInsights: async (): Promise<AIInsight[]> => {
    const response = await api.get('/ai/insights');
    return response.data;
  },

  // Generate new AI insights
  generateInsights: async (): Promise<AIInsight[]> => {
    const response = await api.post('/ai/insights/generate');
    return response.data;
  },
  // Preview insights (no DB write)
  previewInsights: async (): Promise<any[]> => {
    const response = await api.get('/ai/insights/preview');
    return response.data?.data ?? response.data;
  },

  // Delete insight
  deleteInsight: async (insightId: string): Promise<void> => {
    await api.delete(`/ai/insights/${insightId}`);
  },

  // Get AI recommendations
  getRecommendations: async (): Promise<AIRecommendation[]> => {
    const response = await api.get('/ai/recommendations');
    // Normalisasi amount (Prisma Decimal bisa datang sebagai string)
    return (response.data as AIRecommendation[]).map((r) => ({
      ...r,
      amount:
        r.amount != null ? Number(r.amount as unknown as string) : undefined,
    }));
  },

  // Generate new AI recommendations
  generateRecommendations: async (): Promise<AIRecommendation[]> => {
    const response = await api.post('/ai/recommendations/generate');
    return response.data;
  },
  // Preview recommendations (no DB write)
  previewRecommendations: async (): Promise<any[]> => {
    const response = await api.get('/ai/recommendations/preview');
    return response.data?.data ?? response.data;
  },

  // Mark recommendation as read
  markRecommendationAsRead: async (recommendationId: string): Promise<void> => {
    await api.patch(`/ai/recommendations/${recommendationId}/read`);
  },

  // Get AI dashboard data
  getAIDashboard: async (): Promise<AIDashboard> => {
    const response = await api.get('/ai/dashboard');
    const data = response.data as AIDashboard;
    return {
      ...data,
      recommendations: (data.recommendations || []).map((r) => ({
        ...r,
        amount:
          r.amount != null ? Number(r.amount as unknown as string) : undefined,
      })),
    };
  },
};
