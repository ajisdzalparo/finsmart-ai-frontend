import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Home,
  Car,
  Plane,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { Goal } from '@/api/goals';

const goalIcons = {
  emergency: Home,
  vacation: Plane,
  car: Car,
  education: GraduationCap,
  investment: TrendingUp,
};

interface GoalProgressCardProps {
  goal: Goal;
  onAddMoney: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  isDeleting?: boolean;
}

export function GoalProgressCard({
  goal,
  onAddMoney,
  onEdit,
  onDelete,
  isDeleting = false,
}: GoalProgressCardProps) {
  const IconComponent = goalIcons[goal.goalType as keyof typeof goalIcons];
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{goal.name}</CardTitle>
          </div>
          <Badge
            className={
              goal.isActive
                ? 'bg-success text-success-foreground'
                : 'bg-muted text-muted-foreground'
            }
          >
            {goal.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className={`font-medium ${getProgressColor(percentage)}`}>
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            <div
              className={`absolute bg-primary top-0 left-0 h-3 rounded-full ${getProgressBarColor(
                percentage,
              )}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-semibold text-success">
              ${goal.currentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold">
              ${goal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {goal.targetDate && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(goal.targetDate).toLocaleDateString()}
            </div>
            <div className="text-muted-foreground">
              ${remaining.toLocaleString()} to go
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onAddMoney(goal)}>
            <DollarSign className="h-3 w-3 mr-1" />
            Add Money
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(goal)}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
