import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  PiggyBank, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { Goal } from '@/api/goals';
import { Transaction } from '@/api/transactions';

interface TransactionGoalIntegrationProps {
  transaction: Transaction;
  goals: Goal[];
  onAddToGoal: (goalId: string, amount: number) => void;
}

export function TransactionGoalIntegration({ 
  transaction, 
  goals, 
  onAddToGoal 
}: TransactionGoalIntegrationProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [amount, setAmount] = useState<number>(transaction.amount);

  // Filter goals yang masih aktif dan belum selesai
  const activeGoals = goals.filter(goal => 
    goal.isActive && goal.currentAmount < goal.targetAmount
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToGoal = () => {
    if (selectedGoal && amount > 0) {
      onAddToGoal(selectedGoal, amount);
      setSelectedGoal('');
      setAmount(transaction.amount);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = getGoalProgress(goal);
    
    if (progress >= 100) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'Selesai' };
    }
    
    if (progress >= 75) {
      return { icon: Target, color: 'text-blue-600', text: 'Hampir Selesai' };
    }
    
    if (progress >= 50) {
      return { icon: PiggyBank, color: 'text-yellow-600', text: 'Setengah Jalan' };
    }
    
    return { icon: AlertCircle, color: 'text-gray-600', text: 'Baru Dimulai' };
  };

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Tambah ke Goal
          </CardTitle>
          <CardDescription>
            Tidak ada goals aktif yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Buat goals terlebih dahulu untuk menggunakan fitur ini
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Tambah ke Goal
        </CardTitle>
        <CardDescription>
          Gunakan transaksi ini untuk menambah progress goals Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{transaction.description || 'Transaksi'}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.transactionDate).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="goal-select">Pilih Goal</Label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih goal yang ingin ditambahkan..." />
              </SelectTrigger>
              <SelectContent>
                {activeGoals.map((goal) => {
                  const status = getGoalStatus(goal);
                  const StatusIcon = status.icon;
                  
                  return (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span>{goal.name}</span>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getGoalProgress(goal).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Jumlah (maksimal {formatCurrency(transaction.amount)})</Label>
            <div className="flex gap-2">
              <input
                id="amount"
                type="number"
                className="flex-1 px-3 py-2 border border-input rounded-md"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={transaction.amount}
                min={0}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(transaction.amount)}
              >
                Max
              </Button>
            </div>
            {amount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(amount)}
              </p>
            )}
          </div>
        </div>

        {/* Selected Goal Preview */}
        {selectedGoal && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">
                {activeGoals.find(g => g.id === selectedGoal)?.name}
              </h4>
              <Badge variant="secondary">
                {getGoalStatus(activeGoals.find(g => g.id === selectedGoal)!).text}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress saat ini</span>
                <span>
                  {formatCurrency(activeGoals.find(g => g.id === selectedGoal)!.currentAmount)} / 
                  {formatCurrency(activeGoals.find(g => g.id === selectedGoal)!.targetAmount)}
                </span>
              </div>
              
              <Progress 
                value={getGoalProgress(activeGoals.find(g => g.id === selectedGoal)!)} 
                className="h-2" 
              />
              
              <div className="flex justify-between text-sm">
                <span>Setelah ditambah</span>
                <span className="font-medium text-green-600">
                  {formatCurrency((activeGoals.find(g => g.id === selectedGoal)!.currentAmount + amount))} / 
                  {formatCurrency(activeGoals.find(g => g.id === selectedGoal)!.targetAmount)}
                </span>
              </div>
              
              <Progress 
                value={((activeGoals.find(g => g.id === selectedGoal)!.currentAmount + amount) / activeGoals.find(g => g.id === selectedGoal)!.targetAmount) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleAddToGoal}
          disabled={!selectedGoal || !amount || amount <= 0}
          className="w-full"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Tambah ke Goal
        </Button>

        {/* Quick Suggestions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Saran Jumlah</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.round(transaction.amount * 0.25))}
            >
              25% ({formatCurrency(Math.round(transaction.amount * 0.25))})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.round(transaction.amount * 0.5))}
            >
              50% ({formatCurrency(Math.round(transaction.amount * 0.5))})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.round(transaction.amount * 0.75))}
            >
              75% ({formatCurrency(Math.round(transaction.amount * 0.75))})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(transaction.amount)}
            >
              100% ({formatCurrency(transaction.amount)})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
