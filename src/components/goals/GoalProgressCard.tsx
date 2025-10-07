import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Home,
  Car,
  Plane,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { Goal } from '@/api/goals';
import { useCurrencyFormatter } from '@/lib/currency';

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
  onViewDetails?: (goal: Goal) => void;
  isDeleting?: boolean;
}

export function GoalProgressCard({
  goal,
  onAddMoney,
  onEdit,
  onDelete,
  onViewDetails,
  isDeleting = false,
}: GoalProgressCardProps) {
  const { format } = useCurrencyFormatter();
  const IconComponent =
    goalIcons[goal.goalType as keyof typeof goalIcons] || TrendingUp;
  const percentage =
    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);

  const getProgressColor = (value: number) => {
    if (value >= 75) return 'text-success';
    if (value >= 50) return 'text-warning';
    return 'text-destructive';
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
            {goal.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progres</span>
            <span className={`font-medium ${getProgressColor(percentage)}`}>
              {Math.round(percentage)}%
            </span>
          </div>
          {/* Gunakan satu komponen progress saja agar tidak dobel layer */}
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm justify-items-center">
          <div className="justify-self-start">
            <p className="text-muted-foreground">Saat ini</p>
            <p className="font-semibold text-success">
              {format(Number(goal.currentAmount))}
            </p>
          </div>
          <div className="justify-self-end">
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold justify-self-start">
              {format(Number(goal.targetAmount))}
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
              {format(Number(remaining))} lagi
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails && onViewDetails(goal)}
          >
            Detail
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onAddMoney(goal)}>
            <Plus className="h-3 w-3 mr-1" />
            Tambah Dana
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(goal)}>
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
