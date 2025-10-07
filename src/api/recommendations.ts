import { useQuery } from '@tanstack/react-query';
import api from './api';

export interface Recommendation {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  amount?: number;
}

export const useRecommendationsQuery = () => {
  return useQuery<Recommendation[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await api.get('/recommendations');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
