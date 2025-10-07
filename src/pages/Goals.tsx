/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Target } from 'lucide-react';
import {
  useGoalsQuery,
  useDeleteGoalMutation,
  useAddMoneyToGoalMutation,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Goals() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showSmartProgress, setShowSmartProgress] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showContributionSuccess, setShowContributionSuccess] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [lastContribution, setLastContribution] = useState<{
    amount: number;
    transactionId: string;
  } | null>(null);

  // API hooks
  const { data: goals = [], isLoading } = useGoalsQuery();
  const deleteGoalMutation = useDeleteGoalMutation();
  const addMoneyMutation = useAddMoneyToGoalMutation();

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

  const handleQuickGoalCreate = async (goalData: any) => {
    try {
      // Here you would call the create goal API
      console.log('Creating goal:', goalData);
      setShowQuickCreate(false);
      // Refresh goals list
    } catch (error) {
      console.error('Error creating goal:', error);
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
          amount: amount,
          transactionId: result.transaction?.id || 'unknown',
        });

        setShowSmartProgress(false);
        setShowContributionSuccess(true);
      } catch (error) {
        console.error('Error adding money to goal:', error);
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
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Financial Goals
          </h1>
          <p className="text-muted-foreground mt-2">
            Set and track your savings goals to achieve your dreams.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => setShowInsights(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => setShowQuickCreate(true)}>
              <Target className="h-4 w-4 mr-2" />
              Quick Create
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openGoalModal()}
              className="bg-primary shadow-primary hover:shadow-elevated"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Goal
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
                whileHover={{ scale: 1.02 }}
              >
                <GoalProgressCard
                  goal={goal}
                  onAddMoney={openSmartProgress}
                  onEdit={openGoalModal}
                  onDelete={openDeleteModal}
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
          <QuickGoalCreation
            onGoalCreate={handleQuickGoalCreate}
            onClose={() => setShowQuickCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Smart Goal Progress Modal */}
      <Dialog open={showSmartProgress} onOpenChange={setShowSmartProgress}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Progress Goal</DialogTitle>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goals Insights & Analytics</DialogTitle>
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
