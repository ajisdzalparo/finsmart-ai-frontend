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
  DashboardData,
} from '@/api/dashboard';
import { useNavigate } from 'react-router-dom';
import { useCurrencyFormatter } from '@/lib/currency';

// Helper functions untuk format data

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
    // Legacy types
    case 'warning':
      return AlertTriangle;
    case 'success':
      return CheckCircle;
    case 'tip':
      return Lightbulb;
    // New types
    case 'spending_analysis':
      return Brain;
    case 'budget_advice':
      return Lightbulb;
    case 'goal_recommendation':
      return Target;
    case 'investment_advice':
      return TrendingUp;
    default:
      return Brain;
  }
};

const getInsightColor = (insightType: string) => {
  switch (insightType) {
    // Legacy types
    case 'warning':
      return 'text-warning';
    case 'success':
      return 'text-success';
    case 'tip':
      return 'text-accent';
    // New types
    case 'spending_analysis':
      return 'text-primary';
    case 'budget_advice':
      return 'text-accent';
    case 'goal_recommendation':
      return 'text-success';
    case 'investment_advice':
      return 'text-primary';
    default:
      return 'text-primary';
  }
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'spending_optimization':
      return TrendingDown;
    case 'investment_advice':
      return TrendingUp;
    case 'savings_improvement':
      return Target;
    case 'goal_acceleration':
      return ArrowUpRight;
    default:
      return Lightbulb;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useDashboardQuery();
  const { format } = useCurrencyFormatter();

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
      value: format(totalBalance),
      change:
        monthlyIncome > 0
          ? `${((totalBalance / monthlyIncome) * 100).toFixed(1)}%`
          : '0%',
      trend: totalBalance >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Monthly Income',
      value: format(monthlyIncome),
      change: monthlyIncome > 0 ? '+0%' : '0%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Monthly Expenses',
      value: format(monthlyExpenses),
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
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleDirectTransaction}
            className="bg-primary shadow-primary hover:shadow-elevated"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Transaction
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="shadow-card hover:shadow-elevated transition-shadow">
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
            </motion.div>
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
                          : 'text-destructive dark:text-destructive-foreground'
                      }`}
                    >
                      {transaction.category?.type === 'income' ? '+' : '-'}
                      {format(Math.abs(transaction.amount))}
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
                        {format(goal.currentAmount)} /{' '}
                        {format(goal.targetAmount)}
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
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Financial Insights</h2>
        </motion.div>

        <div className="grid gap-4">
          {dashboardData.insights && dashboardData.insights.length > 0 ? (
            dashboardData.insights.map((insight: Insight) => {
              const Icon = getInsightIcon(insight.type);
              const color = getInsightColor(insight.type);
              return (
                <Card key={insight.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">
                          {insight.title ||
                            ((insight.data as Record<string, unknown>)
                              ?.title as string) ||
                            'AI Insight'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {insight.message ||
                            ((insight.data as Record<string, unknown>)
                              ?.message as string) ||
                            'No message available'}
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
      </motion.div>

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
                            Amount: {format(recommendation.amount)}
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
            {(() => {
              type AIGuidance = NonNullable<
                DashboardData['aiGoalGuidance']
              >[number];
              const items: Array<AIGuidance | Goal> = (
                dashboardData.aiGoalGuidance &&
                dashboardData.aiGoalGuidance.length > 0
                  ? (dashboardData.aiGoalGuidance as AIGuidance[])
                  : dashboardData.goals
              ) as Array<AIGuidance | Goal>;

              return items.map((item) => {
                const isGuidance = 'goalId' in item;
                const guidance: AIGuidance | undefined = isGuidance
                  ? (item as AIGuidance)
                  : undefined;
                const goal: Goal = isGuidance
                  ? (dashboardData.goals.find(
                      (g) => g.id === (item as AIGuidance).goalId,
                    ) as Goal)
                  : (item as Goal);

                const remaining = goal.targetAmount - goal.currentAmount;
                const progress = (goal.currentAmount / goal.targetAmount) * 100;

                return (
                  <div key={isGuidance ? (item as AIGuidance).goalId : goal.id}>
                    <div className="p-4 bg-muted/50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <span className="font-medium text-sm">
                          {guidance?.title ||
                            `Smart Suggestion untuk ${goal.name}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {guidance?.message ||
                          'Berdasarkan pola pengeluaran Anda, Anda dapat mencapai target lebih cepat dengan:'}
                      </p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {(
                          guidance?.suggestions || [
                            'Mengurangi pengeluaran bulanan sebesar 10%',
                            'Mengotomatiskan transfer ke tabungan setiap bulan',
                            'Memindahkan dana ke rekening dengan bunga tinggi',
                          ]
                        ).map((text: string, idx: number) => (
                          <li key={idx}>• {text}</li>
                        ))}
                      </ul>
                      {guidance?.priority && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Prioritas
                          </span>
                          <Badge
                            variant={
                              guidance.priority === 'high'
                                ? 'destructive'
                                : guidance.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {guidance.priority}
                          </Badge>
                          {guidance.managementScore && (
                            <Badge variant="outline">
                              {guidance.managementScore}
                            </Badge>
                          )}
                        </div>
                      )}
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
                          {format(remaining)} tersisa
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Estimasi:{' '}
                          {(() => {
                            const months =
                              guidance?.monthsToGoal ??
                              (() => {
                                const monthlyIncome =
                                  dashboardData.totals.income;
                                const monthlyExpenses =
                                  dashboardData.totals.expense;
                                const monthlySavings =
                                  monthlyIncome - monthlyExpenses;
                                return monthlySavings > 0
                                  ? Math.ceil(remaining / monthlySavings)
                                  : 0;
                              })();
                            if (!months || months <= 0 || !isFinite(months)) {
                              return 'Tidak dapat diestimasi';
                            }
                            return `${months} bulan`;
                          })()}
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
              });
            })()}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
