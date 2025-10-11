/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, BarChart3, Target, Crown } from 'lucide-react';
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
import FeatureGate from '@/components/subscription/FeatureGate';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useCurrentSubscriptionQuery } from '@/api/subscription';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

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
  const { hasAccess, getPlanFeatures } = useFeatureAccess();
  const { data: currentSubscription } = useCurrentSubscriptionQuery();

  // Cek batasan goals berdasarkan subscription
  const planFeatures = getPlanFeatures();
  const maxGoals = planFeatures.maxGoals;
  const currentGoalCount = goals?.length || 0;

  // Untuk Free plan: batas 2 goals
  // Untuk Premium/Enterprise: unlimited (maxGoals = null)
  const canCreateGoal = maxGoals === null || currentGoalCount < maxGoals;

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
        className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Tujuan Keuangan
          </h1>
          <p className="text-muted-foreground">
            Atur dan pantau tujuan tabungan Anda untuk raih impian.
          </p>
          {maxGoals ? (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={
                  currentGoalCount >= maxGoals ? 'destructive' : 'outline'
                }
                className="text-xs"
              >
                {currentGoalCount} / {maxGoals} tujuan
              </Badge>
              {currentGoalCount >= maxGoals && (
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                Unlimited tujuan
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowInsights(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Insight
          </Button>
          <FeatureGate feature="basic_goals" requiredPlan="free">
            <Button variant="outline" onClick={() => setShowQuickCreate(true)}>
              <Target className="h-4 w-4 mr-2" />
              Buat Cepat
            </Button>
          </FeatureGate>
          <UpgradePrompt
            feature="goals"
            currentLimit={currentGoalCount}
            maxLimit={maxGoals || 2}
          >
            <Button
              onClick={() => openGoalModal()}
              disabled={!canCreateGoal}
              className="bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {canCreateGoal
                ? 'Tambah Tujuan'
                : 'Upgrade ke Premium untuk Unlimited'}
            </Button>
          </UpgradePrompt>
        </div>
      </motion.div>

      {/* Goals Overview */}
      <div className="space-y-6">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <GoalsSummary goals={goals} />
            </motion.div>
          </>
        )}
      </div>

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Buat Goal Baru
            </DialogTitle>
          </DialogHeader>
          <QuickGoalCreation onGoalCreate={handleQuickGoalCreate} />
        </DialogContent>
      </Dialog>

      {/* Smart Goal Progress Modal */}
      <Dialog open={showSmartProgress} onOpenChange={setShowSmartProgress}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Tambah Progres Tujuan
            </DialogTitle>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Insight & Analitik Tujuan
            </DialogTitle>
          </DialogHeader>
          <GoalInsights goals={goals} />
        </DialogContent>
      </Dialog>

      {/* Goal Contribution Success Modal */}
      <Dialog
        open={showContributionSuccess}
        onOpenChange={setShowContributionSuccess}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Kontribusi Berhasil!
            </DialogTitle>
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
