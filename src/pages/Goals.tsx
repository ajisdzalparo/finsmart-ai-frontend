/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Target } from 'lucide-react';
import {
  useGoalsQuery,
  useDeleteGoalMutation,
  useAddMoneyToGoalMutation,
  useCreateGoalMutation,
  Goal,
} from '@/api/goals';
import { GoalModal } from '@/components/modals/GoalModal';
import { AddMoneyModal } from '@/components/modals/AddMoneyModal';
import { DeleteGoalModal } from '@/components/modals/DeleteGoalModal';
import { GoalProgressCard } from '@/components/goals/GoalProgressCard';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { EmptyGoalsState } from '@/components/goals/EmptyGoalsState';
import { GoalsLoadingState } from '@/components/goals/GoalsLoadingState';
import { QuickGoalCreation } from '@/components/goals/QuickGoalCreation';
import { SmartGoalProgress } from '@/components/goals/SmartGoalProgress';
import { GoalInsights } from '@/components/goals/GoalInsights';
import { GoalContributionSuccess } from '@/components/goals/GoalContributionSuccess';
import { GoalDetailModal } from '@/components/modals/GoalDetailModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Tabs dihapus karena tidak digunakan pada halaman ini
import { useToast } from '@/hooks/use-toast';

export default function Goals() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showSmartProgress, setShowSmartProgress] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showContributionSuccess, setShowContributionSuccess] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [lastContribution, setLastContribution] = useState<{
    amount: number;
    transactionId: string;
  } | null>(null);

  // API hooks
  const { data: goals = [], isLoading } = useGoalsQuery();
  const deleteGoalMutation = useDeleteGoalMutation();
  const addMoneyMutation = useAddMoneyToGoalMutation();
  const createGoalMutation = useCreateGoalMutation();
  const { toast } = useToast();

  const openGoalModal = (goal?: Goal) => {
    setSelectedGoal(goal || null);
    setShowGoalModal(true);
  };

  const openAddMoneyModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowAddMoneyModal(true);
  };

  const openDeleteModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const openSmartProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowSmartProgress(true);
  };

  const openDetailModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  };

  const handleQuickGoalCreate = async (goalData: any) => {
    try {
      await createGoalMutation.mutateAsync(goalData);
      setShowQuickCreate(false);
      toast({ title: 'Berhasil', description: 'Goal berhasil dibuat' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat goal',
        variant: 'destructive',
      });
    }
  };

  const handleAddMoneyToGoal = async (amount: number) => {
    if (selectedGoal) {
      try {
        const result = await addMoneyMutation.mutateAsync({
          id: selectedGoal.id,
          data: { amount },
        });

        // Store contribution details for success modal
        setLastContribution({
          amount: Number(amount),
          transactionId: result.transaction?.id || 'unknown',
        });

        setShowSmartProgress(false);
        setShowContributionSuccess(true);
        toast({ title: 'Berhasil', description: 'Dana berhasil ditambahkan' });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Gagal menambahkan dana ke goal',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return <GoalsLoadingState />;
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tujuan Keuangan
          </h1>
          <p className="text-muted-foreground mt-2">
            Atur dan pantau tujuan tabungan Anda untuk raih impian.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => setShowInsights(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Insight
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => setShowQuickCreate(true)}>
              <Target className="h-4 w-4 mr-2" />
              Buat Cepat
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openGoalModal()}
              className="bg-primary shadow-primary hover:shadow-elevated"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Tujuan
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Goals Overview */}
      {goals.length === 0 ? (
        <EmptyGoalsState onCreateGoal={() => openGoalModal()} />
      ) : (
        <>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <GoalProgressCard
                  goal={goal}
                  onAddMoney={openSmartProgress}
                  onEdit={openGoalModal}
                  onDelete={openDeleteModal}
                  onViewDetails={openDetailModal}
                  isDeleting={deleteGoalMutation.isPending}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Goals Summary */}
          <GoalsSummary goals={goals} />
        </>
      )}

      {/* Modals */}
      <GoalDetailModal
        goal={selectedGoal}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
      <GoalModal
        goal={selectedGoal}
        open={showGoalModal}
        onOpenChange={setShowGoalModal}
      />
      <AddMoneyModal
        goal={selectedGoal}
        open={showAddMoneyModal}
        onOpenChange={setShowAddMoneyModal}
      />
      <DeleteGoalModal
        goal={selectedGoal}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />

      {/* Quick Goal Creation Modal */}
      <Dialog open={showQuickCreate} onOpenChange={setShowQuickCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Goal Baru</DialogTitle>
          </DialogHeader>
          <QuickGoalCreation onGoalCreate={handleQuickGoalCreate} />
        </DialogContent>
      </Dialog>

      {/* Smart Goal Progress Modal */}
      <Dialog open={showSmartProgress} onOpenChange={setShowSmartProgress}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Progres Tujuan</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <SmartGoalProgress
              goal={selectedGoal}
              onAddMoney={handleAddMoneyToGoal}
              onClose={() => setShowSmartProgress(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Goals Insights Modal */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insight & Analitik Tujuan</DialogTitle>
          </DialogHeader>
          <GoalInsights goals={goals} />
        </DialogContent>
      </Dialog>

      {/* Goal Contribution Success Modal */}
      <Dialog
        open={showContributionSuccess}
        onOpenChange={setShowContributionSuccess}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kontribusi Berhasil!</DialogTitle>
          </DialogHeader>
          {selectedGoal && lastContribution && (
            <GoalContributionSuccess
              goal={selectedGoal}
              contributionAmount={lastContribution.amount}
              transactionId={lastContribution.transactionId}
              onViewTransactions={() => {
                setShowContributionSuccess(false);
                // Here you could navigate to transactions page or show transaction details
                console.log('View transactions for goal:', selectedGoal.id);
              }}
              onClose={() => {
                setShowContributionSuccess(false);
                setSelectedGoal(null);
                setLastContribution(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
