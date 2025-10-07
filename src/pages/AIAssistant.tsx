/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { aiApi, AIDashboard } from '@/api/ai';
import { useCurrencyFormatter } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import SocketAIChat from '@/components/ai/SocketAIChat';
import AISchedulerPanel from '@/components/ai/AISchedulerPanel';

export default function AIAssistant() {
  const [dashboard, setDashboard] = useState<AIDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { format } = useCurrencyFormatter();

  useEffect(() => {
    loadAIDashboard();
  }, []);

  const loadAIDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await aiApi.getAIDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading AI dashboard:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markRecommendationAsRead = async (recommendationId: string) => {
    try {
      await aiApi.markRecommendationAsRead(recommendationId);
      await loadAIDashboard();
    } catch (error) {
      console.error('Error marking recommendation as read:', error);
    }
  };

  const deleteInsight = async (insightId: string) => {
    try {
      await aiApi.deleteInsight(insightId);
      await loadAIDashboard();
      toast({
        title: 'Berhasil',
        description: 'Insight telah dihapus',
      });
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus insight',
        variant: 'destructive',
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_analysis':
        return TrendingUp;
      case 'goal_recommendation':
        return Target;
      case 'budget_advice':
        return Lightbulb;
      case 'investment_advice':
        return Brain;
      default:
        return Brain;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'spending_optimization':
        return TrendingUp;
      case 'savings_improvement':
        return Target;
      case 'goal_acceleration':
        return CheckCircle;
      case 'investment_advice':
        return Brain;
      default:
        return Lightbulb;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground mt-2">
              Asisten AI untuk analisis finansial Anda
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Asisten AI untuk analisis finansial Anda
          </p>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard?.statistics.totalInsights || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard?.statistics.totalRecommendations || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard?.statistics.unreadRecommendations || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Unread Recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-200 dark:bg-gray-800">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="realtime">Real-time AI</TabsTrigger>
          <TabsTrigger value="scheduler">AI Scheduler</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {dashboard?.insights && dashboard.insights.length > 0 ? (
              dashboard.insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                const color = getInsightColor(insight.priority);

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${color}`} />
                            <CardTitle className="text-lg">
                              {insight.title}
                            </CardTitle>
                            <Badge variant="outline" className={color}>
                              {insight.priority}
                            </Badge>
                          </div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteInsight(insight.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {insight.message}
                        </p>
                        {insight.data?.summary && (
                          <div className="mt-3 p-3 rounded-md border border-border bg-muted/30">
                            <div className="text-sm font-medium mb-2">
                              Ringkasan
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">
                                  Pendapatan
                                </div>
                                <div className="font-semibold">
                                  {format(
                                    Number(
                                      insight.data.summary.totalIncome || 0,
                                    ),
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Pengeluaran
                                </div>
                                <div className="font-semibold">
                                  {format(
                                    Number(
                                      insight.data.summary.totalExpense || 0,
                                    ),
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Saldo
                                </div>
                                <div
                                  className={`font-semibold ${
                                    Number(
                                      insight.data.summary.totalIncome || 0,
                                    ) -
                                      Number(
                                        insight.data.summary.totalExpense || 0,
                                      ) <
                                    0
                                      ? 'text-destructive'
                                      : 'text-success'
                                  }`}
                                >
                                  {format(
                                    Number(
                                      insight.data.summary.totalIncome || 0,
                                    ) -
                                      Number(
                                        insight.data.summary.totalExpense || 0,
                                      ),
                                  )}
                                </div>
                              </div>
                            </div>
                            {Array.isArray(insight.data.summary.goals) &&
                              insight.data.summary.goals.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm font-medium mb-2">
                                    Goals
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    {insight.data.summary.goals.map(
                                      (g: {
                                        id: string;
                                        name: string;
                                        currentAmount: number;
                                        targetAmount: number;
                                      }) => (
                                        <div
                                          key={g.id}
                                          className="flex justify-between"
                                        >
                                          <div className="text-muted-foreground">
                                            {g.name}
                                          </div>
                                          <div className="font-medium">
                                            {format(
                                              Number(g.currentAmount || 0),
                                            )}{' '}
                                            /{' '}
                                            {format(
                                              Number(g.targetAmount || 0),
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-3">
                          Generated:{' '}
                          {new Date(insight.generatedAt).toLocaleString(
                            'id-ID',
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Belum ada AI Insights
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Gunakan AI Scheduler untuk mengatur generasi insights
                    otomatis
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {dashboard?.recommendations &&
            dashboard.recommendations.length > 0 ? (
              dashboard.recommendations.map((recommendation, index) => {
                const Icon = getRecommendationIcon(recommendation.type);

                return (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <Card className={recommendation.isRead ? 'opacity-60' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {recommendation.title}
                            </CardTitle>
                            <Badge
                              variant={
                                recommendation.priority === 'high'
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {recommendation.priority}
                            </Badge>
                            {!recommendation.isRead && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!recommendation.isRead && (
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    markRecommendationAsRead(recommendation.id)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {recommendation.message}
                        </p>
                        {recommendation.amount != null && (
                          <div className="text-sm font-medium text-primary mb-2">
                            Amount: {format(Number(recommendation.amount))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Created:{' '}
                          {new Date(recommendation.createdAt).toLocaleString(
                            'id-ID',
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Belum ada Recommendations
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Gunakan AI Scheduler untuk mengatur generasi recommendations
                    otomatis
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* Real-time AI Chat dengan Socket.IO */}
        <TabsContent value="realtime" className="space-y-6">
          <SocketAIChat />
        </TabsContent>

        {/* AI Scheduler */}
        <TabsContent value="scheduler" className="space-y-6">
          <AISchedulerPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
