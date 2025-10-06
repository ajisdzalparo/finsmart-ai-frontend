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

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const barData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Spending',
      data: [500, 400, 300, 600, 700, 500],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    },
  ],
};

const pieData = {
  labels: ['Food', 'Transport', 'Shopping', 'Others'],
  datasets: [
    {
      label: 'Category Breakdown',
      data: [35, 25, 20, 20],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
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

const reports = [
  {
    name: 'Monthly Expense Report',
    description: 'Detailed breakdown of monthly spending by category',
    date: 'January 2024',
    status: 'ready',
  },
  {
    name: 'Income vs Expense Analysis',
    description: 'Compare your income and expenses over time',
    date: 'Q4 2023',
    status: 'ready',
  },
  {
    name: 'Goal Progress Report',
    description: 'Track progress towards your financial goals',
    date: '2024 YTD',
    status: 'generating',
  },
];

export default function Reports() {
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
        <Button className="bg-primary shadow-md hover:bg-primary/90 flex items-center">
          <Download className="h-4 w-4 mr-2" /> Export Data
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
              <Bar data={barData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex justify-center p-4 rounded-lg bg-muted/10 dark:bg-muted/20">
              <Pie data={pieData} options={chartOptions} />
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
            {reports.map((report, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 dark:hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {report.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      report.status === 'ready' ? 'default' : 'secondary'
                    }
                  >
                    {report.status === 'ready' ? 'Ready' : 'Generating'}
                  </Badge>
                  {report.status === 'ready' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate New Report */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: BarChart3, label: 'Expense Report' },
              { icon: TrendingUp, label: 'Trend Analysis' },
              { icon: PieChart, label: 'Category Report' },
            ].map((item, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-24 flex flex-col justify-center items-center gap-2 hover:shadow-md"
              >
                <item.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
