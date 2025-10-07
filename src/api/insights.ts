import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface Insight {
  id: string;
  insightType: string;
  data: Record<string, unknown>;
  userId: string;
  generatedAt: string;
}

export interface CreateInsightData {
  insightType: string;
  data: Record<string, unknown>;
}

export const useInsightsQuery = () => {
  return useQuery<Insight[]>({
    queryKey: ['insights'],
    queryFn: async () => {
      const response = await api.get('/insights');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateInsightMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInsightData) => {
      const response = await api.post('/insights', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
};
