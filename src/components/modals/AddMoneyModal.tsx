import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useCurrencyFormatter } from '@/lib/currency';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAddMoneyToGoalMutation, Goal } from '@/api/goals';
import { DollarSign, TrendingUp } from 'lucide-react';

interface AddMoneyModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMoneyModal({
  goal,
  open,
  onOpenChange,
}: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const addMoneyMutation = useAddMoneyToGoalMutation();
  const { format } = useCurrencyFormatter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !amount) return;

    try {
      await addMoneyMutation.mutateAsync({
        id: goal.id,
        data: { amount: parseFloat(amount) },
      });
      setAmount('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding money:', error);
    }
  };

  if (!goal) return null;

  const currentProgress = (goal.currentAmount / goal.targetAmount) * 100;
  const newProgress =
    ((goal.currentAmount + parseFloat(amount || '0')) / goal.targetAmount) *
    100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Add Money to Goal
          </DialogTitle>
          <DialogDescription>
            Add money to <strong>"{goal.name}"</strong> to help reach your
            target of <strong>{format(Number(goal.targetAmount))}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Current Progress */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Current Progress</span>
                <span className="font-medium">
                  {Math.round(currentProgress)}%
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(Number(goal.currentAmount))}</span>
                <span>{format(Number(goal.targetAmount))}</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <CurrencyInput
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onValueChange={(v) => setAmount(String(v))}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 500, 1000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="text-xs"
                  >
                    {format(quickAmount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview New Progress */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    New Progress
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    Progress after adding {format(Number(amount || '0'))}
                  </span>
                  <span className="font-medium text-success">
                    {Math.round(newProgress)}%
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(newProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {format(Number(goal.currentAmount) + Number(amount || '0'))}
                  </span>
                  <span>{format(Number(goal.targetAmount))}</span>
                </div>
              </div>
            )}

            {/* Remaining Amount */}
            {goal.targetDate && (
              <div className="text-sm text-muted-foreground text-center">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addMoneyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                addMoneyMutation.isPending || !amount || parseFloat(amount) <= 0
              }
            >
              {addMoneyMutation.isPending ? 'Adding...' : 'Add Money'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
