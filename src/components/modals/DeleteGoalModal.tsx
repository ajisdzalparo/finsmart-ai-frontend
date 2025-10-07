import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteGoalMutation, Goal } from '@/api/goals';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteGoalModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGoalModal({
  goal,
  open,
  onOpenChange,
}: DeleteGoalModalProps) {
  const deleteGoalMutation = useDeleteGoalMutation();

  const handleDelete = async () => {
    if (!goal) return;

    try {
      await deleteGoalMutation.mutateAsync(goal.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  if (!goal) return null;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Goal
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the goal
            and all its progress.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Goal Info */}
          <div className="p-4 bg-muted rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{goal.name}</h3>
              <span className="text-sm text-muted-foreground">
                {goal.goalType.charAt(0).toUpperCase() + goal.goalType.slice(1)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>${goal.currentAmount.toLocaleString()}</span>
                <span>${goal.targetAmount.toLocaleString()}</span>
              </div>
            </div>

            {goal.targetDate && (
              <div className="text-sm text-muted-foreground mt-2">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive mb-1">Warning</h4>
                <p className="text-sm text-destructive/80">
                  You are about to delete this goal permanently. All progress
                  data will be lost.
                  {remaining > 0 && (
                    <span className="block mt-1">
                      You still need ${remaining.toLocaleString()} to reach your
                      target.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteGoalMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteGoalMutation.isPending}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {deleteGoalMutation.isPending ? 'Deleting...' : 'Delete Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
