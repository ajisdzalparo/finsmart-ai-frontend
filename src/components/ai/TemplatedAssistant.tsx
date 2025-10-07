import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  aiApi,
  type AIInsight,
  type AIRecommendation,
  type AIDashboard,
} from '@/api/ai';
import { Loader2, Sparkles, Lightbulb, Bot } from 'lucide-react';

type AssistantMessage =
  | { role: 'assistant'; type: 'insights'; data: AIInsight[] }
  | { role: 'assistant'; type: 'recommendations'; data: AIRecommendation[] }
  | { role: 'assistant'; type: 'dashboard'; data: AIDashboard }
  | { role: 'system'; type: 'error'; message: string };

interface TemplatedAssistantProps {
  title?: string;
}

export function TemplatedAssistant({
  title = 'AI Assistant',
}: TemplatedAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const runTemplate = async (
    kind: 'insights' | 'recommendations' | 'dashboard',
  ) => {
    setIsLoading(true);
    try {
      if (kind === 'insights') {
        const data = await aiApi.previewInsights();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'insights', data },
        ]);
      } else if (kind === 'recommendations') {
        const data = await aiApi.previewRecommendations();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'recommendations', data },
        ]);
      } else {
        const data = await aiApi.getAIDashboard();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'dashboard', data },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          type: 'error',
          message: 'Gagal memproses permintaan AI.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="secondary"
              className="justify-start"
              disabled={isLoading}
              onClick={() => runTemplate('insights')}
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Analisis pengeluaran
              terbaru
            </Button>
            <Button
              variant="secondary"
              className="justify-start"
              disabled={isLoading}
              onClick={() => runTemplate('recommendations')}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Rekomendasi penghematan
              personal
            </Button>
            <Button
              variant="secondary"
              className="justify-start"
              disabled={isLoading}
              onClick={() => runTemplate('dashboard')}
            >
              <Loader2
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />{' '}
              Ringkas dashboard AI
            </Button>
          </div>

          <Separator />

          <div className="space-y-3 max-h-80 overflow-auto">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Pilih salah satu template di atas untuk mendapatkan jawaban dari
                AI.
              </div>
            ) : null}

            {messages.map((m, idx) => {
              if (m.type === 'error') {
                return (
                  <div key={idx} className="text-sm text-destructive">
                    {m.message}
                  </div>
                );
              }
              if (m.type === 'insights') {
                return (
                  <div key={idx} className="space-y-2">
                    <div className="text-sm font-medium">AI Insights</div>
                    <div className="space-y-2">
                      {m.data.map((it) => (
                        <div key={it.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{it.title}</div>
                            <Badge variant="outline">{it.priority}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {it.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (m.type === 'recommendations') {
                return (
                  <div key={idx} className="space-y-2">
                    <div className="text-sm font-medium">
                      AI Recommendations
                    </div>
                    <div className="space-y-2">
                      {m.data.map((it) => (
                        <div key={it.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{it.title}</div>
                            <Badge variant="secondary">{it.priority}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {it.message}
                          </div>
                          {'amount' in it && it.amount != null ? (
                            <div className="text-xs">
                              Estimasi dampak: {it.amount}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              // dashboard
              return (
                <div key={idx} className="space-y-2">
                  <div className="text-sm font-medium">
                    AI Dashboard Ringkas
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="p-3 border rounded text-sm">
                      Total insights: {m.data.statistics.totalInsights}
                    </div>
                    <div className="p-3 border rounded text-sm">
                      Rekomendasi: {m.data.statistics.totalRecommendations}
                    </div>
                    <div className="p-3 border rounded text-sm">
                      Belum dibaca: {m.data.statistics.unreadRecommendations}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplatedAssistant;
