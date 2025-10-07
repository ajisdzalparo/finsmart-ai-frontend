import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  DollarSign,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Gamepad2,
  Heart,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { useCurrencyFormatter } from '@/lib/currency';

const categories = [
  { value: 'food', label: 'Food & Dining', icon: Coffee },
  { value: 'transport', label: 'Transportation', icon: Car },
  { value: 'shopping', label: 'Shopping', icon: ShoppingCart },
  { value: 'housing', label: 'Housing', icon: Home },
  { value: 'entertainment', label: 'Entertainment', icon: Gamepad2 },
  { value: 'healthcare', label: 'Healthcare', icon: Heart },
  { value: 'income', label: 'Income', icon: TrendingUp },
  { value: 'bills', label: 'Bills & Utilities', icon: CreditCard },
];

interface AddTransactionDialogProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTransactionAdd?: (transaction: any) => void;
}

export default function AddTransactionDialog({
  children,
  onTransactionAdd,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { format } = useCurrencyFormatter();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: '',
    category: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transaction = {
      id: Date.now(),
      description: formData.description,
      amount:
        formData.type === 'expense'
          ? -Math.abs(parseFloat(formData.amount))
          : Math.abs(parseFloat(formData.amount)),
      category: formData.category,
      notes: formData.notes,
      date: formData.date,
      type: formData.type,
    };

    onTransactionAdd?.(transaction);

    // Reset form
    setFormData({
      description: '',
      amount: '',
      type: '',
      category: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });

    setOpen(false);
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find((cat) => cat.value === categoryValue);
    return category?.icon || DollarSign;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] shadow-elevated">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add New Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
              {formData.amount && (
                <p className="text-[11px] text-muted-foreground">
                  = {format(Math.abs(Number(formData.amount) || 0))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cmfxri3530008930eh3351ih5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Income
                  </div>
                </SelectItem>
                <SelectItem value="cmfxri34y0006930ecqmhkkgw">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-destructive" />
                    Expense
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary shadow-primary hover:shadow-elevated"
              disabled={
                !formData.description ||
                !formData.amount ||
                !formData.type ||
                !formData.category
              }
            >
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
