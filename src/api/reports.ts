/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface Report {
  id: string;
  reportType: string;
  periodStart?: string;
  periodEnd?: string;
  exportFormat?: string;
  generatedAt: string;
  summary?: unknown;
}

export interface CreateReportPayload {
  reportType: string;
  periodStart?: string;
  periodEnd?: string;
  exportFormat?: string;
}

export const reportsApi = {
  list: async (): Promise<Report[]> => {
    const data = await api.get('/reports');
    return data as Report[];
  },
  create: async (payload: CreateReportPayload): Promise<Report> => {
    const data = await api.post('/reports', payload);
    return data as Report;
  },
};
