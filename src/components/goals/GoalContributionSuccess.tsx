import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  PiggyBank, 
  TrendingUp, 
  Target,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Goal } from '@/api/goals';

interface GoalContributionSuccessProps {
  goal: Goal;
  contributionAmount: number;
  transactionId: string;
  onViewTransactions: () => void;
  onClose: () => void;
}

export function GoalContributionSuccess({ 
  goal, 
  contributionAmount, 
  transactionId,
  onViewTransactions,
  onClose 
}: GoalContributionSuccessProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const getProgressMessage = () => {
    if (isCompleted) {
      return {
        icon: CheckCircle,
        title: 'Goal Tercapai! 🎉',
        description: 'Selamat! Anda telah mencapai target goal ini.',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
    
    if (progress >= 75) {
      return {
        icon: TrendingUp,
        title: 'Hampir Selesai!',
        description: 'Goal Anda sudah hampir tercapai. Tinggal sedikit lagi!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    }
    
    if (progress >= 50) {
      return {
        icon: Target,
        title: 'Setengah Jalan',
        description: 'Bagus! Anda sudah mencapai setengah dari target.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    }
    
    return {
      icon: PiggyBank,
      title: 'Langkah Awal',
      description: 'Kontribusi pertama Anda ke goal ini. Terus semangat!',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const status = getProgressMessage();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800">Kontribusi Berhasil!</h3>
        <p className="text-muted-foreground">
          Uang telah ditambahkan ke goal "{goal.name}"
        </p>
      </div>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detail Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Jumlah Kontribusi:</span>
            <span className="font-bold text-green-600">
              +{formatCurrency(contributionAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{new Date().toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>ID Transaksi:</span>
            <span className="font-mono text-sm">{transactionId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Berhasil
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progress Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${status.bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <span className={`font-medium ${status.color}`}>{status.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{status.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Saat Ini</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(goal.currentAmount)} terkumpul</span>
              <span>Target: {formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>

          {!isCompleted && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sisa yang dibutuhkan:</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Langkah Selanjutnya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <PiggyBank className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Lihat Riwayat Transaksi</p>
              <p className="text-sm text-muted-foreground">
                Lihat semua kontribusi yang pernah Anda lakukan
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewTransactions}
              className="ml-auto"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Lihat
            </Button>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Lanjutkan Kontribusi</p>
                <p className="text-sm text-muted-foreground">
                  Tambahkan lebih banyak uang untuk mencapai target
                </p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Goal Tercapai!</p>
                <p className="text-sm text-green-700">
                  Selamat! Anda telah berhasil mencapai target goal ini.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Tutup
        </Button>
        <Button onClick={onViewTransactions} className="flex-1">
          Lihat Transaksi
        </Button>
      </div>
    </div>
  );
}
