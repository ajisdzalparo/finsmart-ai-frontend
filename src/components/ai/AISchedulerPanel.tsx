import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Play,
  Calendar,
  CheckCircle,
  AlertCircle,
  Brain,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/api';

interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'inactive';
  lastRun: string | null;
  nextRun: string | null;
}

export default function AISchedulerPanel() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      const data = await api.get('/ai-scheduler/tasks');
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runTask = async (taskId: string) => {
    setIsGenerating(taskId);
    try {
      await api.post(`/ai-scheduler/tasks/${taskId}/run`);
      toast({
        title: 'Berhasil',
        description: 'Task berhasil dijalankan',
      });
      fetchScheduledTasks();
    } catch (error) {
      console.error('Error running task:', error);
      toast({
        title: 'Error',
        description: 'Gagal menjalankan task',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const toggleScheduler = async (taskId: string, activate: boolean) => {
    setIsGenerating(taskId);
    try {
      await api.post(
        `/ai-scheduler/tasks/${taskId}/${activate ? 'activate' : 'deactivate'}`,
        {
          activate,
        },
      );
      toast({
        title: 'Berhasil',
        description: `Scheduler ${activate ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      fetchScheduledTasks();
    } catch (error) {
      console.error('Error toggling scheduler:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status scheduler',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'daily-insights':
        return Brain;
      case 'weekly-recommendations':
        return Lightbulb;
      case 'monthly-analysis':
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const getScheduleDescription = (schedule: string) => {
    if (schedule.includes('0 8 * * *')) return 'Setiap hari jam 08:00';
    if (schedule.includes('0 9 * * 1')) return 'Setiap Senin jam 09:00';
    if (schedule.includes('0 10 1 * *')) return 'Setiap tanggal 1 jam 10:00';
    return schedule;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Scheduler Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Scheduler
        </h2>
        <p className="text-muted-foreground">
          Kelola otomatisasi AI untuk analisis finansial Anda
        </p>
      </div>

      {/* Scheduler Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {tasks.map((task) => {
          const Icon = getTaskIcon(task.id);
          const isRunning = isGenerating === task.id;
          const isActive = task.status === 'active';
          const getScheduleDescription = (schedule: string) => {
            switch (schedule) {
              case '0 8 * * *':
                return 'Setiap hari jam 08:00';
              case '0 9 * * 1':
                return 'Setiap Senin jam 09:00';
              case '0 10 1 * *':
                return 'Tanggal 1 setiap bulan jam 10:00';
              default:
                return schedule;
            }
          };

          return (
            <Card
              key={task.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isActive
                  ? 'ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/20'
                  : 'bg-muted/30'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{task.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getScheduleDescription(task.schedule)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={`${
                      isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-muted'
                    }`}
                  >
                    {isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Terakhir dijalankan:{' '}
                      {task.lastRun
                        ? new Date(task.lastRun).toLocaleString('id-ID')
                        : 'Belum pernah'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isActive ? 'destructive' : 'default'}
                    onClick={() => toggleScheduler(task.id, !isActive)}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    {isActive ? 'Hentikan' : 'Aktifkan'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runTask(task.id)}
                    disabled={isRunning || !isActive}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <>
                        <Clock className="h-4 w-4 mr-1 animate-spin" />
                        Menjalankan...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Jalankan Sekarang
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
              )}
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Informasi Scheduler
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Daily Insights
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Setiap hari jam 08:00
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Weekly Recommendations
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Setiap Senin jam 09:00
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Monthly Analysis
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tanggal 1 setiap bulan jam 10:00
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/30 dark:bg-gray-800/30 px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 inline mr-1" />
              Semua waktu dalam zona waktu Asia/Jakarta
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
