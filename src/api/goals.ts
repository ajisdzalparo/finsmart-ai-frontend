import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

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

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  goalType: string;
  isActive?: boolean;
}

export interface UpdateGoalData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  goalType?: string;
  isActive?: boolean;
}

export interface AddMoneyData {
  amount: number;
}

export const useGoalsQuery = () => {
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await api.get('/goals');
      return response.data?.data ?? response.data;
    },
  });
};

export const useGoalQuery = (id: string) => {
  return useQuery<Goal>({
    queryKey: ['goals', id],
    queryFn: async () => {
      const response = await api.get(`/goals/${id}`);
      return response.data?.data ?? response.data;
    },
    enabled: !!id,
  });
};

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGoalData) => {
      const response = await api.post('/goals', data);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGoalData }) => {
      const response = await api.put(`/goals/${id}`, data);
      return response.data?.data ?? response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
    },
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/goals/${id}`);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useAddMoneyToGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddMoneyData }) => {
      const response = await api.post(`/goals/${id}/add-money`, data);
      return response.data?.data ?? response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
    },
  });
};
