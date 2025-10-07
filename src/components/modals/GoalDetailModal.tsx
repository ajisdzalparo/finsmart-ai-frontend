import { Goal } from '@/api/goals';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormatter } from '@/lib/currency';
import { Calendar, Tag, Clock } from 'lucide-react';

interface GoalDetailModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailModal({
  goal,
  open,
  onOpenChange,
}: GoalDetailModalProps) {
  const { format } = useCurrencyFormatter();

  if (!goal) return null;

  const progress =
    (Number(goal.currentAmount) / Number(goal.targetAmount || 1)) * 100;
  const remaining = Math.max(
    0,
    Number(goal.targetAmount) - Number(goal.currentAmount),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{goal.name}</span>
            <Badge
              className={
                goal.isActive
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {goal.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detail lengkap tujuan keuangan Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Terkumpul</p>
                  <p className="font-semibold text-success">
                    {format(Number(goal.currentAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-semibold">
                    {format(Number(goal.targetAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sisa</p>
                  <p className="font-semibold">{format(remaining)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Tipe Tujuan</p>
                    <p className="font-medium text-sm capitalize">
                      {goal.goalType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {goal.targetDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Target Tanggal
                      </p>
                      <p className="font-medium text-sm">
                        {new Date(goal.targetDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Dibuat</p>
                    <p className="font-medium text-sm">
                      {new Date(goal.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
