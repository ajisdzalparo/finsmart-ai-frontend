import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  useDashboardQuery,
  Transaction,
  Goal,
  Insight,
  Recommendation,
} from '@/api/dashboard';
import { useNavigate } from 'react-router-dom';

// Helper functions untuk format data
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays === 0) return 'Today';
  return `${diffDays} days ago`;
};

const getCategoryName = (transaction: Transaction) => {
  return transaction.category?.name || 'Uncategorized';
};

const getInsightIcon = (insightType: string) => {
  switch (insightType) {
    case 'warning':
      return AlertTriangle;
    case 'success':
      return CheckCircle;
    case 'tip':
      return Lightbulb;
    default:
      return Brain;
  }
};

const getInsightColor = (insightType: string) => {
  switch (insightType) {
    case 'warning':
      return 'text-warning';
    case 'success':
      return 'text-success';
    case 'tip':
      return 'text-accent';
    default:
      return 'text-primary';
  }
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'spending_optimization':
      return TrendingDown;
    case 'investment':
      return TrendingUp;
    case 'savings':
      return Target;
    default:
      return Lightbulb;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useDashboardQuery();

  const handleDirectTransaction = () => {
    navigate('/transactions');
  };

  const totalBalance =
    (dashboardData?.totals.income || 0) - (dashboardData?.totals.expense || 0);
  const monthlyIncome = dashboardData?.totals.income || 0;
  const monthlyExpenses = dashboardData?.totals.expense || 0;
  const savingsRate =
    monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      change:
        monthlyIncome > 0
          ? `${((totalBalance / monthlyIncome) * 100).toFixed(1)}%`
          : '0%',
      trend: totalBalance >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyIncome),
      change: monthlyIncome > 0 ? '+0%' : '0%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      change: monthlyExpenses > 0 ? '+0%' : '0%',
      trend: 'down',
      icon: TrendingDown,
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      change: `Target: 20%`,
      trend: savingsRate >= 20 ? 'up' : savingsRate >= 10 ? 'neutral' : 'down',
      icon: Target,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Loading your financial data...
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Error loading data</p>
          </div>
        </div>
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Failed to load dashboard data
            </h3>
            <p className="text-muted-foreground">
              Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <Button
          onClick={handleDirectTransaction}
          className="bg-primary shadow-primary hover:shadow-elevated"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Transaction
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-card hover:shadow-elevated transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === 'up' && (
                    <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                  )}
                  {stat.trend === 'down' && (
                    <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <span
                    className={
                      stat.trend === 'up'
                        ? 'text-success'
                        : stat.trend === 'down'
                        ? 'text-destructive'
                        : ''
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recent.length > 0 ? (
                dashboardData.recent.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(transaction)} •{' '}
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.category?.type === 'income'
                          ? 'text-success'
                          : 'text-destructive'
                      }`}
                    >
                      {transaction.category?.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No transactions found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardData.goals && dashboardData.goals.length > 0 ? (
                dashboardData.goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} /{' '}
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress
                      value={(goal.currentAmount / goal.targetAmount) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.round(
                        (goal.currentAmount / goal.targetAmount) * 100,
                      )}
                      % complete
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No goals found. Create your first goal to start saving!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Analysis & Insights */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Financial Insights</h2>
        </div>

        <div className="grid gap-4">
          {dashboardData.insights && dashboardData.insights.length > 0 ? (
            dashboardData.insights.map((insight) => {
              const Icon = getInsightIcon(insight.insightType);
              const color = getInsightColor(insight.insightType);
              return (
                <Card key={insight.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">
                          {((insight.data as Record<string, unknown>)
                            ?.title as string) || 'AI Insight'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {((insight.data as Record<string, unknown>)
                            ?.message as string) || 'No message available'}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDate(insight.generatedAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  AI insights akan muncul setelah Anda memiliki lebih banyak
                  data transaksi.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recommendations &&
          dashboardData.recommendations.length > 0 ? (
            <div className="grid gap-4">
              {dashboardData.recommendations.map((recommendation, index) => {
                const Icon = getRecommendationIcon(recommendation.type);
                return (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">
                            {recommendation.title}
                          </h3>
                          <Badge
                            variant={
                              recommendation.priority === 'high'
                                ? 'destructive'
                                : recommendation.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="ml-2"
                          >
                            {recommendation.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {recommendation.message}
                        </p>
                        {recommendation.amount && (
                          <div className="text-xs text-muted-foreground">
                            Amount: {formatCurrency(recommendation.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                AI recommendations akan muncul setelah Anda memiliki data
                transaksi yang cukup.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal AI Guidance */}
      {dashboardData.goals && dashboardData.goals.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              AI Goal Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.goals.slice(0, 1).map((goal) => {
              const remaining = goal.targetAmount - goal.currentAmount;
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const monthlyIncome = dashboardData.totals.income;
              const monthlyExpenses = dashboardData.totals.expense;
              const monthlySavings = monthlyIncome - monthlyExpenses;
              const monthsToGoal =
                monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : 0;

              return (
                <div key={goal.id}>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-accent" />
                      <span className="font-medium text-sm">
                        Smart Suggestion untuk {goal.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Berdasarkan pola pengeluaran Anda, Anda dapat mencapai
                      target lebih cepat dengan:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Mengurangi pengeluaran bulanan sebesar 10%</li>
                      <li>
                        • Mengotomatiskan transfer ke tabungan setiap bulan
                      </li>
                      <li>
                        • Memindahkan dana ke rekening dengan bunga tinggi
                      </li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-sm font-medium text-success">
                        ⚡ Ini bisa membantu Anda mencapai target{' '}
                        {monthsToGoal > 0
                          ? `${monthsToGoal - 1} bulan lebih cepat!`
                          : 'lebih cepat!'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 border border-border rounded-lg">
                      <div className="text-sm font-medium mb-1">
                        Target Tersisa
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {goal.name}
                      </div>
                      <div className="text-lg font-bold">
                        {formatCurrency(remaining)} tersisa
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Estimasi:{' '}
                        {monthsToGoal > 0
                          ? `${monthsToGoal} bulan`
                          : 'Tidak dapat diestimasi'}
                      </div>
                    </div>

                    <div className="p-3 border border-border rounded-lg">
                      <div className="text-sm font-medium mb-1">
                        Progress Score
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {goal.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-success">
                          {progress.toFixed(1)}%
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            progress >= 80
                              ? 'text-success border-success'
                              : progress >= 50
                              ? 'text-warning border-warning'
                              : 'text-destructive border-destructive'
                          }
                        >
                          {progress >= 80
                            ? 'Excellent'
                            : progress >= 50
                            ? 'Good'
                            : 'Needs Work'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
