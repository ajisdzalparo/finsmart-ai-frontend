import api from './api';

export type CashflowMonthlyRow = {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
};

export type CashflowMonthlyResponse = {
  rows: CashflowMonthlyRow[];
};

export const statsApi = {
  // Menggunakan generator report 'cashflow_monthly' untuk mengambil deret waktu
  getCashflowMonthly: async (params?: {
    periodStart?: string;
    periodEnd?: string;
  }): Promise<CashflowMonthlyResponse> => {
    const payload = {
      reportType: 'cashflow_monthly',
      periodStart: params?.periodStart,
      periodEnd: params?.periodEnd,
      exportFormat: 'json',
    } as const;
    const report = await api.post('/reports', payload);
    const summary = (report?.summary ?? {}) as unknown;
    const rows =
      typeof summary === 'object' &&
      summary !== null &&
      'cashflowMonthly' in summary
        ? (summary as { cashflowMonthly: CashflowMonthlyRow[] })
            .cashflowMonthly || []
        : [];
    return { rows };
  },
  getExpenseByCategory: async (params?: {
    periodStart?: string;
    periodEnd?: string;
  }): Promise<{ rows: Array<{ categoryName: string; amount: number }> }> => {
    const payload = {
      reportType: 'expense_by_category',
      periodStart: params?.periodStart,
      periodEnd: params?.periodEnd,
      exportFormat: 'json',
    } as const;
    const report = await api.post('/reports', payload);
    const summary = (report?.summary ?? {}) as unknown;
    const rows =
      typeof summary === 'object' &&
      summary !== null &&
      'expenseByCategory' in summary
        ? (
            summary as {
              expenseByCategory: Array<{
                categoryName: string;
                amount: number;
              }>;
            }
          ).expenseByCategory || []
        : [];
    return { rows };
  },
};
