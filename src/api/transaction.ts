import { useMutation } from '@tanstack/react-query';
import api from './api';
import { queryClient } from './queryClient';

export interface TransactionData {
  amount: number;
  description: string;
  currency: string;
  categoryId: string;
  transactionDate: string;
}

export interface TransactionResponse {
  id: string;
  templateId: null | string;
  amount: number;
  currency: string;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
  autoCategorized: boolean;
  categoryId: string;
  userId: string;
  batchId: null | string;
  createdAt: string;
}

export const useMutationTransaction = () => {
  return useMutation({
    mutationKey: ['transaction'],
    mutationFn: async (data: TransactionData) => {
      const { data: res } = await api.post<TransactionResponse>(
        '/transactions/quick',
        data,
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
