import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  PiggyBank,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Goal } from '@/api/goals';
import { useTransactionsQuery } from '@/api/transactions';

interface SmartGoalProgressProps {
  goal: Goal;
  onAddMoney: (amount: number) => void;
  onClose: () => void;
}

export function SmartGoalProgress({
  goal,
  onAddMoney,
  onClose,
}: SmartGoalProgressProps) {
  const [amount, setAmount] = useState<number>(0);
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manual' | 'transaction'>(
    'manual',
  );

  const { data: transactions = [] } = useTransactionsQuery();

  // Filter transactions yang bisa digunakan untuk goal (income atau transfer)
  const availableTransactions = transactions.filter(
    (t) =>
      t.amount > 0 && // Hanya transaksi positif
      new Date(t.transactionDate) >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 hari terakhir
  );

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSuggestedAmounts = () => {
    const suggestions = [];

    // 10% dari target
    const tenPercent = Math.round(goal.targetAmount * 0.1);
    if (tenPercent > 0) suggestions.push(tenPercent);

    // 25% dari target
    const twentyFivePercent = Math.round(goal.targetAmount * 0.25);
    if (twentyFivePercent > 0) suggestions.push(twentyFivePercent);

    // 50% dari target
    const fiftyPercent = Math.round(goal.targetAmount * 0.5);
    if (fiftyPercent > 0) suggestions.push(fiftyPercent);

    // Sisa yang dibutuhkan
    if (remainingAmount > 0) suggestions.push(remainingAmount);

    return suggestions
      .filter(
        (amount, index, arr) => amount > 0 && arr.indexOf(amount) === index,
      )
      .slice(0, 4);
  };

  const handleAddMoney = () => {
    if (amount > 0) {
      onAddMoney(amount);
      setAmount(0);
    }
  };

  const handleUseTransaction = () => {
    if (selectedTransaction) {
      const transaction = availableTransactions.find(
        (t) => t.id === selectedTransaction,
      );
      if (transaction) {
        onAddMoney(transaction.amount);
        setSelectedTransaction('');
      }
    }
  };

  const getGoalStatus = () => {
    if (isCompleted) {
      return {
        icon: CheckCircle,
        text: 'Goal Tercapai!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    }

    if (progress >= 75) {
      return {
        icon: TrendingUp,
        text: 'Hampir Selesai!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    }

    if (progress >= 50) {
      return {
        icon: Target,
        text: 'Setengah Jalan',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    }

    return {
      icon: AlertCircle,
      text: 'Baru Dimulai',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    };
  };

  const status = getGoalStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Goal Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {goal.name}
              </CardTitle>
              <CardDescription>
                Target: {formatCurrency(goal.targetAmount)}
              </CardDescription>
            </div>
            <Badge variant={isCompleted ? 'default' : 'secondary'}>
              {status.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${status.bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <span className={`font-medium ${status.color}`}>
                {status.text}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Terkumpul</span>
                <span className="font-medium">
                  {formatCurrency(goal.currentAmount)}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progress.toFixed(1)}%</span>
                <span>Sisa: {formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Money Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'manual' | 'transaction')
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="transaction">Dari Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tambah Uang Manual</CardTitle>
              <CardDescription>
                Masukkan jumlah uang yang ingin ditambahkan ke goal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Jumlah</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                {amount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(amount)}
                  </p>
                )}
              </div>

              {/* Quick Amount Suggestions */}
              <div>
                <Label className="text-sm font-medium">Saran Jumlah</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getSuggestedAmounts().map((suggestedAmount, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(suggestedAmount)}
                      className="text-xs"
                    >
                      {formatCurrency(suggestedAmount)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddMoney}
                disabled={!amount || amount <= 0}
                className="w-full"
              >
                <PiggyBank className="w-4 h-4 mr-2" />
                Tambah ke Goal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gunakan Transaksi</CardTitle>
              <CardDescription>
                Pilih transaksi yang ingin digunakan untuk goal ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableTransactions.length > 0 ? (
                <>
                  <div>
                    <Label>Pilih Transaksi</Label>
                    <Select
                      value={selectedTransaction}
                      onValueChange={setSelectedTransaction}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih transaksi..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTransactions.map((transaction) => (
                          <SelectItem
                            key={transaction.id}
                            value={transaction.id}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {transaction.description || 'Transaksi'}
                              </span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTransaction && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {
                              availableTransactions.find(
                                (t) => t.id === selectedTransaction,
                              )?.description
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(
                              availableTransactions.find(
                                (t) => t.id === selectedTransaction,
                              )?.amount || 0,
                            )}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUseTransaction}
                    disabled={!selectedTransaction}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Gunakan Transaksi untuk Goal
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Tidak ada transaksi yang tersedia untuk digunakan
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Buat transaksi income terlebih dahulu
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goal Timeline */}
      {goal.targetDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Target Date:</span>
                <span className="font-medium">
                  {new Date(goal.targetDate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hari Tersisa:</span>
                <span className="font-medium">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(goal.targetDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}{' '}
                  Hari
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
