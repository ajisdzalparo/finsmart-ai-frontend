import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  FileText,
} from 'lucide-react';
import { exportReportToExcel } from '@/lib/export';
import { useCurrencyFormatter } from '@/lib/currency';

import { Pie, Line } from 'react-chartjs-2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reportsApi,
  type Report,
  type ReportsPaginatedResponse,
} from '@/api/reports';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { DateRange } from 'react-day-picker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Data placeholder; akan diganti dengan data dari API stats
const lineDataPlaceholder = {
  labels: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'],
  datasets: [
    {
      label: 'Spending',
      data: [500, 400, 300, 600, 700, 500],
      borderColor: 'rgba(239, 68, 68, 0.9)',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
  ],
};

const pieData = {
  labels: [],
  datasets: [
    {
      label: 'Category Breakdown',
      data: [],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(99,102,241,0.7)',
        'rgba(251,146,60,0.7)',
        'rgba(20,184,166,0.7)',
        'rgba(168,85,247,0.7)',
      ],
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: '#1f2937',
      },
    },
    tooltip: {
      backgroundColor: '#e5e7eb',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
    },
    title: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#1f2937' },
      grid: { color: 'rgba(255,255,255,0.1)' },
    },
    y: {
      ticks: { color: '#1f2937' },
      grid: { color: 'rgba(255,255,255,0.1)' },
    },
  },
};

const insights = [
  {
    title: 'Spending Trend',
    description: 'Your spending has decreased by 15% compared to last month',
    type: 'positive',
    icon: TrendingUp,
  },
  {
    title: 'Top Category',
    description: 'Food & Dining accounts for 35% of your expenses',
    type: 'neutral',
    icon: PieChart,
  },
  {
    title: 'Budget Status',
    description: "You're 12% over budget in Transportation",
    type: 'warning',
    icon: BarChart3,
  },
];

// Report type now imported from api module

function useReportsPaginatedQuery(page: number, limit: number) {
  return useQuery<ReportsPaginatedResponse>({
    queryKey: ['reports', 'list', page, limit],
    queryFn: async () => {
      return await reportsApi.listPaginated(page, limit);
    },
  });
}

function useCreateReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      reportType: string;
      periodStart?: string;
      periodEnd?: string;
      exportFormat?: string;
    }) => {
      return await reportsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export default function Reports() {
  const { format } = useCurrencyFormatter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lineData, setLineData] = useState(lineDataPlaceholder);
  const [categoryRows, setCategoryRows] = useState<
    Array<{ categoryName: string; amount: number }>
  >([]);
  const [pieState, setPieState] = useState(pieData);
  // Ambil data cashflow bulanan untuk Line Chart (Monthly Spending Trend)
  React.useEffect(() => {
    let isMounted = true;
    import('@/api/stats')
      .then(({ statsApi }) => statsApi.getCashflowMonthly())
      .then((res) => {
        if (!isMounted) return;
        const labels = res.rows.map((r) => r.month);
        const spending = res.rows.map((r) => Number(r.expense || 0));
        setLineData({
          labels,
          datasets: [
            {
              label: 'Spending',
              data: spending,
              borderColor: 'rgba(239, 68, 68, 0.9)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              fill: true,
              tension: 0.3,
              pointRadius: 2,
            },
          ],
        });
      })
      .catch(() => {
        // fallback diam jika gagal
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Ambil data expense by category untuk Pie Chart dan detail
  React.useEffect(() => {
    let isMounted = true;
    import('@/api/stats')
      .then(({ statsApi }) => statsApi.getExpenseByCategory())
      .then((res) => {
        if (!isMounted) return;
        setCategoryRows(res.rows);
        const labels = res.rows.map((r) => r.categoryName);
        const data = res.rows.map((r) => Number(r.amount || 0));
        setPieState((prev) => ({
          ...prev,
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data,
            },
          ],
        }));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);
  const reportsQuery = useReportsPaginatedQuery(page, limit);
  const reportsPage = reportsQuery.data as ReportsPaginatedResponse | undefined;
  const createReport = useCreateReportMutation();
  const [form, setForm] = useState({
    reportType: 'expense_by_category',
    periodStart: '',
    periodEnd: '',
    exportFormat: 'json',
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const formatDateLabel = (d?: Date) =>
    d
      ? new Date(d).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';
  const toISO = (d?: Date) =>
    d
      ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10)
      : '';

  const applyRange = (from?: Date, to?: Date) => {
    setDateRange({ from, to });
    setForm((f) => ({ ...f, periodStart: toISO(from), periodEnd: toISO(to) }));
  };
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'negative':
        return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'border-muted bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Gain insights into your spending patterns and financial health.
          </p>
        </div>
        <Button
          className="bg-primary shadow-md hover:bg-primary/90 flex items-center"
          onClick={() => createReport.mutate(form)}
        >
          <Download className="h-4 w-4 mr-2" /> Generate Report
        </Button>
      </div>

      {/* Key Insights */}
      <Card className="shadow-md bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${getInsightColor(
                    insight.type,
                  )} transition-colors hover:shadow-md`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-semibold">{insight.title}</h3>
                  </div>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex justify-center p-4 rounded-lg bg-muted/10 dark:bg-muted/20">
              <Line data={lineData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-72 flex justify-center p-4 rounded-lg bg-muted/10 dark:bg-muted/20">
                <Pie data={pieState} options={chartOptions} />
              </div>
              <div className="rounded-lg border p-4 bg-muted/10 dark:bg-muted/20">
                <div className="text-sm font-medium mb-3">Detail</div>
                {(() => {
                  const total = categoryRows.reduce(
                    (s, r) => s + Number(r.amount || 0),
                    0,
                  );
                  const top = [...categoryRows]
                    .sort((a, b) => Number(b.amount) - Number(a.amount))
                    .slice(0, 5);
                  return (
                    <div className="space-y-2">
                      {top.map((r, i) => {
                        const pct =
                          total > 0 ? (Number(r.amount) / total) * 100 : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-36 text-sm">{r.categoryName}</div>
                            <div className="flex-1 h-2 bg-muted rounded">
                              <div
                                className="h-2 bg-primary rounded"
                                style={{ width: `${pct.toFixed(2)}%` }}
                              />
                            </div>
                            <div className="w-36 text-right text-sm">
                              {format(Number(r.amount))} ({pct.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                      {total > 0 ? (
                        <div className="text-xs text-muted-foreground mt-2">
                          Total pengeluaran: {format(Number(total))}
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant removed as requested */}

      {/* Available Reports */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(reportsPage?.items || []).map((report, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 dark:hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.reportType}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.generatedAt).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {report.periodStart
                          ? new Date(report.periodStart).toLocaleDateString(
                              'id-ID',
                            )
                          : '-'}{' '}
                        –{' '}
                        {report.periodEnd
                          ? new Date(report.periodEnd).toLocaleDateString(
                              'id-ID',
                            )
                          : '-'}
                      </span>
                    </div>
                    {(() => {
                      const s = report.summary as unknown;
                      const ai =
                        typeof s === 'object' && s !== null && 'aiInsights' in s
                          ? (
                              s as {
                                aiInsights?: Array<{
                                  title: string;
                                  message: string;
                                  priority?: string;
                                }>;
                              }
                            ).aiInsights
                          : undefined;
                      if (!ai || ai.length === 0) return null;
                      return (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            AI Insights
                          </div>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            {ai.slice(0, 3).map((it, i) => (
                              <li key={i}>
                                <span className="font-medium">{it.title}</span>
                                {it.message ? (
                                  <span className="text-muted-foreground">
                                    {' '}
                                    — {it.message}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Ready</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Lihat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Report Detail: {report.reportType}
                        </DialogTitle>
                        <DialogDescription>
                          Periode:{' '}
                          {report.periodStart
                            ? new Date(report.periodStart).toLocaleDateString(
                                'id-ID',
                              )
                            : '-'}{' '}
                          –{' '}
                          {report.periodEnd
                            ? new Date(report.periodEnd).toLocaleDateString(
                                'id-ID',
                              )
                            : '-'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Render summary berdasarkan tipe */}
                        {(() => {
                          const s = report.summary as unknown;
                          if (
                            report.reportType === 'expense_by_category' &&
                            typeof s === 'object' &&
                            s !== null &&
                            'expenseByCategory' in s
                          ) {
                            const rows = (
                              s as {
                                expenseByCategory: Array<{
                                  category: string;
                                  amount: number;
                                  percentage: number;
                                }>;
                              }
                            ).expenseByCategory;
                            return (
                              <div className="space-y-4">
                                <h4 className="font-semibold">
                                  Pengeluaran per Kategori
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2">
                                          Kategori
                                        </th>
                                        <th className="text-right p-2">
                                          Jumlah
                                        </th>
                                        <th className="text-right p-2">
                                          Persentase
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b">
                                          <td className="p-2">
                                            {row.category}
                                          </td>
                                          <td className="text-right p-2">
                                            {format(Number(row.amount))}
                                          </td>
                                          <td className="text-right p-2">
                                            {row.percentage
                                              ? row.percentage.toFixed(1)
                                              : '0.0'}
                                            %
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          }
                          if (
                            report.reportType === 'income_vs_expense' &&
                            typeof s === 'object' &&
                            s !== null &&
                            'totals' in s
                          ) {
                            const totals = (
                              s as {
                                totals: {
                                  income: number;
                                  expense: number;
                                  net: number;
                                };
                              }
                            ).totals;
                            return (
                              <div className="space-y-4">
                                <h4 className="font-semibold">
                                  Ringkasan Pendapatan vs Pengeluaran
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                      {format(Number(totals.income))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Pendapatan
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                      {format(Number(totals.expense))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Pengeluaran
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {format(Number(totals.net))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Net
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          if (
                            report.reportType === 'cashflow_monthly' &&
                            typeof s === 'object' &&
                            s !== null &&
                            'cashflowMonthly' in s
                          ) {
                            const rows = (
                              s as {
                                cashflowMonthly: Array<{
                                  month: string;
                                  income: number;
                                  expense: number;
                                  net: number;
                                }>;
                              }
                            ).cashflowMonthly;
                            return (
                              <div className="space-y-4">
                                <h4 className="font-semibold">
                                  Cashflow Bulanan
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2">Bulan</th>
                                        <th className="text-right p-2">
                                          Pendapatan
                                        </th>
                                        <th className="text-right p-2">
                                          Pengeluaran
                                        </th>
                                        <th className="text-right p-2">Net</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b">
                                          <td className="p-2">{row.month}</td>
                                          <td className="text-right p-2 text-green-600">
                                            {format(Number(row.income))}
                                          </td>
                                          <td className="text-right p-2 text-red-600">
                                            {format(Number(row.expense))}
                                          </td>
                                          <td className="text-right p-2 font-medium">
                                            {format(Number(row.net))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          }
                          // Fallback tampilkan JSON ringkas
                          return (
                            <div className="space-y-4">
                              <h4 className="font-semibold">Data Report</h4>
                              <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto max-h-60">
                                {JSON.stringify(report.summary, null, 2)}
                              </pre>
                            </div>
                          );
                        })()}

                        {/* AI Insights untuk report */}
                        {(() => {
                          const s = report.summary as unknown;
                          const ai =
                            typeof s === 'object' &&
                            s !== null &&
                            'aiInsights' in s
                              ? (
                                  s as {
                                    aiInsights?: Array<{
                                      type: string;
                                      title: string;
                                      message: string;
                                      priority: string;
                                    }>;
                                  }
                                ).aiInsights
                              : null;

                          if (ai && ai.length > 0) {
                            return (
                              <div className="space-y-4">
                                <h4 className="font-semibold">AI Insights</h4>
                                <div className="space-y-3">
                                  {ai.map((insight, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg border ${
                                        insight.priority === 'high'
                                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                                          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                                      }`}
                                    >
                                      <div className="font-medium text-sm">
                                        {insight.title}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {insight.message}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReportToExcel(report)}
                  >
                    <Download className="h-3 w-3 mr-1" /> Download Excel
                  </Button>
                </div>
              </div>
            ))}
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const total = reportsPage?.pagination.total || 0;
                  const from = total === 0 ? 0 : (page - 1) * limit + 1;
                  const to = Math.min(page * limit, total);
                  const totalPages = reportsPage?.pagination.totalPages || 1;
                  return `Menampilkan ${from}–${to} dari ${total} (Hal ${page} / ${totalPages})`;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    const next = Number(val);
                    setLimit(next);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Baris / halaman" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((opt) => (
                      <SelectItem key={opt} value={String(opt)}>
                        {opt} / halaman
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    « Pertama
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ‹ Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          reportsPage?.pagination.totalPages || 1,
                          p + 1,
                        ),
                      )
                    }
                    disabled={page >= (reportsPage?.pagination.totalPages || 1)}
                  >
                    Selanjutnya ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage(reportsPage?.pagination.totalPages || 1)
                    }
                    disabled={page >= (reportsPage?.pagination.totalPages || 1)}
                  >
                    Terakhir »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate New Report */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Jenis Laporan</Label>
              <Select
                value={form.reportType}
                onValueChange={(v) => setForm((f) => ({ ...f, reportType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_by_category">
                    Expense by Category
                  </SelectItem>
                  <SelectItem value="income_vs_expense">
                    Income vs Expense
                  </SelectItem>
                  <SelectItem value="cashflow_monthly">
                    Cashflow Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Periode</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from || dateRange.to
                        ? `${formatDateLabel(
                            dateRange.from,
                          )} – ${formatDateLabel(dateRange.to)}`
                        : 'Pilih rentang tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <div className="p-3">
                      <CalendarUI
                        mode="range"
                        selected={dateRange}
                        onSelect={(r: DateRange | undefined) =>
                          applyRange(r?.from, r?.to)
                        }
                        numberOfMonths={2}
                        showOutsideDays
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            applyRange(
                              new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                1,
                              ),
                              new Date(),
                            )
                          }
                        >
                          Bulan ini
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const now = new Date();
                            const start = new Date(
                              now.getFullYear(),
                              now.getMonth() - 1,
                              1,
                            );
                            const end = new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              0,
                            );
                            applyRange(start, end);
                          }}
                        >
                          Bulan lalu
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => applyRange(undefined, undefined)}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const now = new Date();
                            applyRange(new Date(now.getFullYear(), 0, 1), now);
                          }}
                        >
                          YTD
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                className="w-full"
                onClick={() => createReport.mutate(form)}
                disabled={createReport.isPending}
              >
                {createReport.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
