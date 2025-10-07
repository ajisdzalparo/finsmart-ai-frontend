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

export interface ReportsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportsPaginatedResponse {
  items: Report[];
  pagination: ReportsPaginationMeta;
}

export const reportsApi = {
  list: async (): Promise<Report[]> => {
    // Untuk non-paginated, backend mengembalikan array langsung
    const body = (await api.get('/reports')) as unknown;
    return body as Report[];
  },
  listPaginated: async (
    page: number,
    limit: number,
  ): Promise<ReportsPaginatedResponse> => {
    // Untuk paginated, backend mengembalikan bentuk { success, message, data, pagination }
    const body = (await api.get('/reports', {
      params: { page, limit },
    })) as unknown as {
      success?: boolean;
      message?: string;
      data?: unknown;
      pagination?: ReportsPaginationMeta;
    };
    const items = (Array.isArray(body?.data) ? body.data : []) as Report[];
    const pagination: ReportsPaginationMeta = body?.pagination ?? {
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
    return { items, pagination };
  },
  create: async (payload: CreateReportPayload): Promise<Report> => {
    const body = (await api.post('/reports', payload)) as unknown;
    return body as Report;
  },
};
