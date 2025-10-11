import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import api from './api';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  transactionDate: string;
  isRecurring: boolean;
  autoCategorized: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'transfer';
    color?: string;
    icon?: string;
  };
  userId: string;
  batchId?: string;
  createdAt: string;
}

export interface CreateTransactionData {
  amount: number;
  currency: string;
  description?: string;
  transactionDate: string;
  categoryId?: string;
  templateId?: string;
  goalAllocations?: Array<{
    goalId: string;
    amount: number;
  }>;
}

export interface UpdateTransactionData {
  amount?: number;
  currency?: string;
  description?: string;
  transactionDate?: string;
  categoryId?: string;
  templateId?: string;
}

export interface BatchTransactionData {
  description?: string;
  items: CreateTransactionData[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedTransactionsResponse {
  items: Transaction[];
  pagination: PaginationMeta;
}

export const useTransactionsQuery = () => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transactions');
      return response.data;
    },
  });
};

export const useTransactionQuery = (id: string) => {
  return useQuery<Transaction>({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTransactionsByCategoryQuery = (categoryId: string) => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'category', categoryId],
    queryFn: async () => {
      const response = await api.get(`/transactions/category/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });
};

export const usePaginatedTransactionsQuery = (
  page: number,
  limit: number,
  opts?: { type?: 'all' | 'income' | 'expense' | 'transfer'; q?: string },
) => {
  return useQuery<PaginatedTransactionsResponse>({
    queryKey: [
      'transactions',
      'list',
      page,
      limit,
      opts?.type ?? 'all',
      opts?.q ?? '',
    ],
    queryFn: async () => {
      const response = await api.get('/transactions/list', {
        params: { page, limit, type: opts?.type, q: opts?.q },
      });
      // response berbentuk { success, message, data, pagination }
      const payload = response.data;
      const rawItems = Array.isArray(payload)
        ? (payload as unknown as Transaction[])
        : Array.isArray(payload?.data)
        ? (payload.data as Transaction[])
        : [];
      return {
        items: rawItems,
        pagination: (payload?.pagination ?? {
          total: 0,
          page,
          limit,
          totalPages: 0,
        }) as PaginationMeta,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const response = await api.post('/transactions/quick', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCreateBatchTransactionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchTransactionData) => {
      const response = await api.post('/transactions/batch', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionData;
    }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const validateTransactionName = async (
  description: string,
  categoryId: string,
) => {
  try {
    console.log('API: Validating transaction name:', description, 'for category:', categoryId);
    const response = await api.get('/transactions/validate', {
      params: { description, categoryId },
    });
    console.log('API: Validation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API: Validation error:', error);
    // Return valid by default if API fails
    return { isValid: true };
  }
};
