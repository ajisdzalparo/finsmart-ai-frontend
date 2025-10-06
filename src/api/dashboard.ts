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

export interface DashboardData {
  totals: { income: number; expense: number };
  recent: Transaction[];
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
      };
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
