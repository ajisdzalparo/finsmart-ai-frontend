import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  PiggyBank,
} from 'lucide-react';
import { Goal } from '@/api/goals';
import { useCurrencyFormatter } from '@/lib/currency';

interface GoalInsightsProps {
  goals: Goal[];
}

export function GoalInsights({ goals }: GoalInsightsProps) {
  const { format } = useCurrencyFormatter();
  const insights = useMemo(() => {
    const activeGoals = goals.filter((goal) => goal.isActive);
    const completedGoals = goals.filter(
      (goal) => Number(goal.currentAmount) >= Number(goal.targetAmount),
    );
    const totalTargetAmount = activeGoals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount),
      0,
    );
    const totalCurrentAmount = activeGoals.reduce(
      (sum, goal) => sum + Number(goal.currentAmount),
      0,
    );
    const overallProgress =
      totalTargetAmount > 0
        ? (totalCurrentAmount / totalTargetAmount) * 100
        : 0;

    // Goals yang hampir selesai (75%+)
    const nearCompletion = activeGoals.filter(
      (goal) =>
        Number(goal.currentAmount) / Number(goal.targetAmount) >= 0.75 &&
        Number(goal.currentAmount) < Number(goal.targetAmount),
    );

    // Goals yang tertinggal (kurang dari 25%)
    const behindGoals = activeGoals.filter(
      (goal) => Number(goal.currentAmount) / Number(goal.targetAmount) < 0.25,
    );

    // Goals dengan target date yang sudah lewat
    const overdueGoals = activeGoals.filter((goal) => {
      if (!goal.targetDate) return false;
      return (
        new Date(goal.targetDate) < new Date() &&
        Number(goal.currentAmount) < Number(goal.targetAmount)
      );
    });

    // Goals yang akan selesai dalam 30 hari
    const upcomingDeadlines = activeGoals.filter((goal) => {
      if (!goal.targetDate) return false;
      const daysUntilTarget = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      return (
        daysUntilTarget <= 30 &&
        daysUntilTarget > 0 &&
        Number(goal.currentAmount) < Number(goal.targetAmount)
      );
    });

    return {
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
      nearCompletion,
      behindGoals,
      overdueGoals,
      upcomingDeadlines,
    };
  }, [goals]);

  const formatCurrency = (amount: number) => {
    return format(amount);
  };

  const getGoalStatus = (goal: Goal) => {
    const progress =
      (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

    if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: 'Selesai',
      };
    }

    if (progress >= 75) {
      return {
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        text: 'Hampir Selesai',
      };
    }

    if (progress >= 50) {
      return {
        icon: Target,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        text: 'Setengah Jalan',
      };
    }

    return {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      text: 'Baru Dimulai',
    };
  };

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada goals yang dibuat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {insights.activeGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.completedGoals.length} selesai
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {format(insights.totalTargetAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(insights.totalCurrentAmount)} terkumpul
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Progress Keseluruhan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {insights.overallProgress.toFixed(1)}%
            </div>
            <Progress value={insights.overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Hampir Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {insights.nearCompletion.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.behindGoals.length} tertinggal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {(insights.overdueGoals.length > 0 ||
        insights.upcomingDeadlines.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Perhatian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.overdueGoals.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900 dark:border-red-800 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-300">
                    Goals Terlambat
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-300">
                  {insights.overdueGoals.map((goal) => (
                    <li key={goal.id}>
                      {goal.name} - Target:{' '}
                      {new Date(goal.targetDate!).toLocaleDateString('id-ID')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.upcomingDeadlines.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-800 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-300">
                    Deadline Mendekat
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {insights.upcomingDeadlines.map((goal) => {
                    const daysLeft = Math.ceil(
                      (new Date(goal.targetDate!).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <li key={goal.id}>
                        {goal.name} - {daysLeft} hari lagi
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goals Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Goals</CardTitle>
          <CardDescription>
            Breakdown status dari semua goals Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.activeGoals.map((goal) => {
              const status = getGoalStatus(goal);
              const progress =
                (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
              const StatusIcon = status.icon;

              return (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${status.bgColor}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(Number(goal.currentAmount))} /{' '}
                        {format(Number(goal.targetAmount))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right min-w-[9rem]">
                    <Badge
                      variant={
                        status.text === 'Selesai' ? 'default' : 'secondary'
                      }
                    >
                      {status.text}
                    </Badge>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-28">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rekomendasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.behindGoals.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:border-blue-800 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    Goals Tertinggal
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Fokus pada {insights.behindGoals.length} goals yang masih di
                  bawah 25% progress
                </p>
              </div>
            )}

            {insights.nearCompletion.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900 dark:border-green-800 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-300">
                    Goals Hampir Selesai
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {insights.nearCompletion.length} goals sudah di atas 75% -
                  sedikit lagi selesai!
                </p>
              </div>
            )}

            {insights.activeGoals.length > 0 &&
              insights.overallProgress < 50 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-800 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">
                      Percepat Progress
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Progress keseluruhan masih di bawah 50%. Pertimbangkan untuk
                    menambah alokasi dana.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
