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
import { useDashboardQuery, Transaction } from '@/api/dashboard';
import { useNavigate } from 'react-router-dom';

const goals = [
  { name: 'Emergency Fund', current: 7300, target: 10000, color: 'bg-accent' },
  { name: 'Vacation', current: 2100, target: 5000, color: 'bg-warning' },
  { name: 'New Car', current: 8500, target: 25000, color: 'bg-success' },
];

const aiInsights = [
  {
    type: 'warning',
    title: 'Spending Alert',
    message:
      'Your food expenses increased by 23% this month. Consider meal planning to reduce costs.',
    icon: AlertTriangle,
    color: 'text-warning',
  },
  {
    type: 'success',
    title: 'Good Progress',
    message:
      "You're on track to reach your Emergency Fund goal 2 months early!",
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    type: 'tip',
    title: 'Optimization Tip',
    message: 'Move $500 from checking to high-yield savings to earn 4.5% APY.',
    icon: Lightbulb,
    color: 'text-accent',
  },
];

const investmentRecommendations = [
  {
    type: 'Conservative',
    name: 'High-Yield Savings',
    return: '4.5% APY',
    risk: 'Low',
    recommendation: 'Ideal for emergency fund',
  },
  {
    type: 'Moderate',
    name: 'Index Fund (S&P 500)',
    return: '10-12% annually',
    risk: 'Medium',
    recommendation: 'Good for long-term goals',
  },
  {
    type: 'Growth',
    name: 'Tech ETF',
    return: '15-18% annually',
    risk: 'High',
    recommendation: 'For aggressive growth',
  },
];

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
              {goals.map((goal) => (
                <div key={goal.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.current)} /{' '}
                      {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress
                    value={(goal.current / goal.target) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </div>
                </div>
              ))}
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
          {aiInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Investment Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Investment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {investmentRecommendations.map((investment, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{investment.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {investment.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">
                      {investment.return}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expected Return
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Level:</span>
                    <span
                      className={`font-medium ${
                        investment.risk === 'Low'
                          ? 'text-success'
                          : investment.risk === 'Medium'
                          ? 'text-warning'
                          : 'text-destructive'
                      }`}
                    >
                      {investment.risk}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {investment.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal AI Guidance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            AI Goal Guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm">Smart Suggestion</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Based on your current spending patterns, you can reach your
              Emergency Fund goal faster by:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Reducing food expenses by $200/month (meal planning)</li>
              <li>• Automating $300/month transfer to savings</li>
              <li>• Moving funds to 4.5% APY account</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-sm font-medium text-success">
                ⚡ This could help you reach your goal 2 months earlier!
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 border border-border rounded-lg">
              <div className="text-sm font-medium mb-1">Next Milestone</div>
              <div className="text-xs text-muted-foreground mb-2">
                Emergency Fund
              </div>
              <div className="text-lg font-bold">$2,700 to go</div>
              <div className="text-xs text-muted-foreground">
                Estimated: 3 months
              </div>
            </div>

            <div className="p-3 border border-border rounded-lg">
              <div className="text-sm font-medium mb-1">Optimization Score</div>
              <div className="text-xs text-muted-foreground mb-2">
                Financial Health
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-success">8.2/10</div>
                <Badge
                  variant="outline"
                  className="text-success border-success"
                >
                  Excellent
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
