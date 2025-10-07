import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal } from '@/api/goals';

interface GoalsSummaryProps {
  goals: Goal[];
}

export function GoalsSummary({ goals }: GoalsSummaryProps) {
  const totalSaved = goals.reduce(
    (acc, goal) => acc + Number(goal.currentAmount),
    0,
  );
  const totalTarget = goals.reduce(
    (acc, goal) => acc + Number(goal.targetAmount),
    0,
  );
  const activeGoals = goals.filter((goal) => goal.isActive).length;
  const completedGoals = goals.filter(
    (goal) => Number(goal.currentAmount) >= Number(goal.targetAmount),
  ).length;
  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Goals Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeGoals}</div>
            <p className="text-sm text-muted-foreground">Active Goals</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {completedGoals}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              ${totalSaved.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Saved</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              ${totalTarget.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Target</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
