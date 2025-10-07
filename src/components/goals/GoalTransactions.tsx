import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PiggyBank,
  Calendar,
  DollarSign,
  Filter,
  Search,
  TrendingUp,
  Target,
} from 'lucide-react';
import { useTransactionsQuery } from '@/api/transactions';
import { Goal } from '@/api/goals';

interface GoalTransactionsProps {
  goal: Goal;
}

export function GoalTransactions({ goal }: GoalTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'large'>('all');

  const { data: allTransactions = [] } = useTransactionsQuery();

  // Filter transactions related to this goal
  const goalTransactions = allTransactions.filter((transaction) =>
    transaction.description?.includes(`Goal Contribution: ${goal.name}`),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort transactions
  const filteredTransactions = goalTransactions
    .filter((transaction) => {
      const matchesSearch = transaction.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter = (() => {
        switch (filterBy) {
          case 'recent':
            return (
              new Date(transaction.transactionDate) >=
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            );
          case 'large':
            return transaction.amount >= 1000000; // 1 juta atau lebih
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return (
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
        );
      } else {
        return b.amount - a.amount;
      }
    });

  const totalContributed = goalTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const averageContribution =
    goalTransactions.length > 0
      ? totalContributed / goalTransactions.length
      : 0;
  const largestContribution = Math.max(
    ...goalTransactions.map((t) => t.amount),
    0,
  );

  if (goalTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Transaksi Goal
          </CardTitle>
          <CardDescription>
            Riwayat kontribusi untuk goal "{goal.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Belum ada kontribusi untuk goal ini
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Mulai tambahkan uang ke goal untuk melihat riwayat transaksi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kontribusi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalContributed)}
            </div>
            <p className="text-xs text-muted-foreground">
              {goalTransactions.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageContribution)}
            </div>
            <p className="text-xs text-muted-foreground">per kontribusi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Kontribusi Terbesar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(largestContribution)}
            </div>
            <p className="text-xs text-muted-foreground">single contribution</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Riwayat Kontribusi
          </CardTitle>
          <CardDescription>
            Semua transaksi yang berkontribusi pada goal "{goal.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'date' | 'amount')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Terbaru</SelectItem>
                  <SelectItem value="amount">Jumlah</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterBy}
                onValueChange={(value) =>
                  setFilterBy(value as 'all' | 'recent' | 'large')
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="recent">7 Hari</SelectItem>
                  <SelectItem value="large">≥1M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <PiggyBank className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(transaction.transactionDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600">
                    +{formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Goal Contribution
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Tidak ada transaksi yang sesuai dengan filter
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
