import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
  Goal,
  CreateGoalData,
} from '@/api/goals';

interface GoalModalProps {
  goal?: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalModal({ goal, open, onOpenChange }: GoalModalProps) {
  const [formData, setFormData] = useState<CreateGoalData>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    goalType: 'emergency',
    isActive: true,
  });

  const createGoalMutation = useCreateGoalMutation();
  const updateGoalMutation = useUpdateGoalMutation();

  const isEdit = !!goal;

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate || '',
        goalType: goal.goalType,
        isActive: goal.isActive,
      });
    } else {
      setFormData({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: '',
        goalType: 'emergency',
        isActive: true,
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && goal) {
        await updateGoalMutation.mutateAsync({
          id: goal.id,
          data: formData,
        });
      } else {
        await createGoalMutation.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const isLoading =
    createGoalMutation.isPending || updateGoalMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your goal details below.'
              : 'Set up a new financial goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Emergency Fund, Vacation Savings"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Target Amount and Current Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  value={formData.targetAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  placeholder="0"
                  value={formData.currentAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Target Date and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalType">Category *</Label>
                <select
                  id="goalType"
                  className="w-full p-2 border rounded-md bg-background"
                  value={formData.goalType}
                  onChange={(e) =>
                    setFormData({ ...formData, goalType: e.target.value })
                  }
                  required
                >
                  <option value="emergency">🏠 Emergency Fund</option>
                  <option value="vacation">✈️ Vacation</option>
                  <option value="car">🚗 Vehicle</option>
                  <option value="education">🎓 Education</option>
                  <option value="investment">📈 Investment</option>
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="text-sm">
                Active Goal
              </Label>
            </div>

            {/* Progress Preview */}
            {formData.targetAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress Preview</span>
                  <span className="font-medium">
                    {Math.round(
                      (formData.currentAmount / formData.targetAmount) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (formData.currentAmount / formData.targetAmount) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>${formData.currentAmount.toLocaleString()}</span>
                  <span>${formData.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                ? 'Update Goal'
                : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
