import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { Bar, Pie, Line } from 'react-chartjs-2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type Report } from '@/api/reports';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function useReportsQuery() {
  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      return await reportsApi.list();
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
  const { data: reports } = useReportsQuery();
  const createReport = useCreateReportMutation();
  const [form, setForm] = useState({
    reportType: 'expense_by_category',
    periodStart: '',
    periodEnd: '',
    exportFormat: 'json',
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = useMemo(() => {
    if (!reports || !selectedReportId) return null;
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);
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
          onClick={() =>
            createReport.mutate(form, {
              onSuccess: (rep) => setSelectedReportId(rep.id),
            })
          }
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
                              Rp {Number(r.amount).toLocaleString('id-ID')} (
                              {pct.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                      {total > 0 ? (
                        <div className="text-xs text-muted-foreground mt-2">
                          Total pengeluaran: Rp {total.toLocaleString('id-ID')}
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

      {/* Available Reports */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(reports || []).map((report, idx) => (
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
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    Lihat
                  </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* Selected Report Detail */}
      {selectedReport && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Report Detail: {selectedReport.reportType}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Periode:{' '}
                {selectedReport.periodStart
                  ? new Date(selectedReport.periodStart).toLocaleDateString(
                      'id-ID',
                    )
                  : '-'}{' '}
                –{' '}
                {selectedReport.periodEnd
                  ? new Date(selectedReport.periodEnd).toLocaleDateString(
                      'id-ID',
                    )
                  : '-'}
              </div>

              {/* Render summary berdasarkan tipe */}
              {(() => {
                const s = selectedReport.summary as unknown;
                if (
                  selectedReport.reportType === 'expense_by_category' &&
                  typeof s === 'object' &&
                  s !== null &&
                  'expenseByCategory' in s
                ) {
                  const rows = (
                    s as {
                      expenseByCategory: Array<{
                        categoryName: string;
                        amount: number;
                      }>;
                    }
                  ).expenseByCategory as Array<{
                    categoryName: string;
                    amount: number;
                  }>;
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2 pr-4">Kategori</th>
                            <th className="py-2">Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={i} className="border-b last:border-b-0">
                              <td className="py-2 pr-4">{r.categoryName}</td>
                              <td className="py-2">
                                Rp {Number(r.amount).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (
                  selectedReport.reportType === 'income_vs_expense' &&
                  typeof s === 'object' &&
                  s !== null &&
                  'totals' in s
                ) {
                  const totals = (
                    s as {
                      totals: {
                        income: number;
                        expense: number;
                        balance: number;
                      };
                    }
                  ).totals;
                  return (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 border rounded">
                        <div className="text-muted-foreground">Income</div>
                        <div className="font-semibold">
                          Rp {Number(totals.income).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="text-muted-foreground">Expense</div>
                        <div className="font-semibold">
                          Rp {Number(totals.expense).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="text-muted-foreground">Balance</div>
                        <div className="font-semibold">
                          Rp {Number(totals.balance).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (
                  selectedReport.reportType === 'cashflow_monthly' &&
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
                        balance: number;
                      }>;
                    }
                  ).cashflowMonthly as Array<{
                    month: string;
                    income: number;
                    expense: number;
                    balance: number;
                  }>;
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2 pr-4">Bulan</th>
                            <th className="py-2 pr-4">Income</th>
                            <th className="py-2 pr-4">Expense</th>
                            <th className="py-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={i} className="border-b last:border-b-0">
                              <td className="py-2 pr-4">{r.month}</td>
                              <td className="py-2 pr-4">
                                Rp {Number(r.income).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2 pr-4">
                                Rp {Number(r.expense).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2">
                                Rp {Number(r.balance).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                // Fallback tampilkan JSON ringkas
                return (
                  <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto max-h-80">
                    {JSON.stringify(selectedReport.summary, null, 2)}
                  </pre>
                );
              })()}

              {/* AI Insights untuk selected report */}
              {(() => {
                const s = selectedReport.summary as unknown;
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
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">AI Insights</div>
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
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-2">
              <Label>Dari</Label>
              <Input
                type="date"
                value={form.periodStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, periodStart: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sampai</Label>
              <Input
                type="date"
                value={form.periodEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, periodEnd: e.target.value }))
                }
              />
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
