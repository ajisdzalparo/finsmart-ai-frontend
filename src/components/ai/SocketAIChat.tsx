/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSocket } from '@/hooks/useSocket';
import {
  Lightbulb,
  Sparkles,
  LayoutGrid,
  Bot,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
  timestamp: Date;
  model?: string;
}

const templates = [
  {
    id: 'insights',
    label: 'Analisis pengeluaran terbaru',
    description:
      'Ringkasan tren pengeluaran, pendapatan vs pengeluaran, dan area yang perlu perhatian dari transaksi terbaru.',
    keywords: [
      'analisis',
      'analisa',
      'pengeluaran',
      'tren',
      'ringkas',
      'insight',
      'keuangan',
      'overview',
    ],
    icon: Lightbulb,
  },
  {
    id: 'recommendations',
    label: 'Rekomendasi penghematan personal',
    description:
      'Saran konkret untuk menghemat, fokus pada kategori boros dan peluang optimasi budget.',
    keywords: [
      'hemat',
      'rekomendasi',
      'optimasi',
      'saran',
      'penghematan',
      'tabungan',
      'saving',
    ],
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    label: 'Ringkas dashboard AI',
    description:
      'Ringkasan cepat: jumlah insight, rekomendasi belum dibaca, dan highlight terbaru.',
    keywords: ['dashboard', 'ringkas', 'statistik', 'resume', 'ikhtisar'],
    icon: LayoutGrid,
  },
  {
    id: 'overspend',
    label: 'Deteksi kategori boros 30 hari terakhir',
    description:
      'Cari kategori dengan lonjakan pengeluaran tertinggi di 30 hari terakhir dan berikan langkah mitigasi.',
    keywords: [
      'boros',
      'lonjakan',
      '30 hari',
      'kategori',
      'overspend',
      'spike',
    ],
    icon: Sparkles,
  },
  {
    id: 'goals',
    label: 'Cek progres goals & percepatan',
    description:
      'Tampilkan progres pencapaian goals utama dan saran percepatan (top-up, penjadwalan ulang).',
    keywords: ['goal', 'progres', 'target', 'percepatan', 'tujuan'],
    icon: Lightbulb,
  },
  {
    id: 'anomaly',
    label: 'Deteksi transaksi tidak biasa',
    description:
      'Cari transaksi yang menyimpang (jumlah besar/tidak lazim) untuk ditinjau.',
    keywords: [
      'anomali',
      'tidak biasa',
      'penipuan',
      'fraud',
      'outlier',
      'janggal',
      'aneh',
    ],
    icon: Lightbulb,
  },
  {
    id: 'subscriptions',
    label: 'Ringkas langganan/recurring & saran pemangkasan',
    description:
      'Daftar pengeluaran berulang, status aktif, dan rekomendasi langganan yang bisa dihentikan.',
    keywords: [
      'langganan',
      'recurring',
      'berulang',
      'subscription',
      'auto-debit',
    ],
    icon: LayoutGrid,
  },
];

export default function SocketAIChat() {
  const { socket, isConnected, currentModel, requestAI, switchModel } =
    useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content:
        'Selamat datang! Anda bisa bertanya bebas tentang keuangan dan investasi, atau gunakan template di samping untuk analisis data keuangan Anda. Chat ini menggunakan Socket.IO untuk komunikasi real-time.',
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleTemplateClick = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    console.log('🚀 Starting AI request for template:', templateId);
    setIsProcessing(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: template.label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await requestAI({
        type: templateId as
          | 'insights'
          | 'recommendations'
          | 'dashboard'
          | 'overspend'
          | 'goals'
          | 'anomaly'
          | 'subscriptions'
          | 'financial-summary'
          | 'investment-summary'
          | 'investment-recommendations',
      });

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          response.message ||
          `Berhasil mendapatkan ${templateId} dari ${response.model} AI`,
        data: response.data,
        timestamp: new Date(),
        model: response.model,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('❌ AI request failed:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsProcessing(true);

    try {
      // Check if it matches any template first
      const matched = templates.find((t) =>
        t.keywords.some((k) => text.toLowerCase().includes(k)),
      );

      let response;
      if (matched) {
        // Use template-based request
        response = await requestAI({
          type: matched.id as
            | 'insights'
            | 'recommendations'
            | 'dashboard'
            | 'overspend'
            | 'goals'
            | 'anomaly'
            | 'subscriptions'
            | 'financial-summary'
            | 'investment-summary'
            | 'investment-recommendations',
        });
      } else {
        // Check if it's a financial/investment related question
        const financialKeywords = [
          'uang',
          'uang',
          'keuangan',
          'finansial',
          'budget',
          'anggaran',
          'tabung',
          'tabungan',
          'saving',
          'investasi',
          'investment',
          'saham',
          'reksadana',
          'obligasi',
          'emas',
          'properti',
          'crypto',
          'bitcoin',
          'pendapatan',
          'income',
          'pengeluaran',
          'expense',
          'hutang',
          'debt',
          'kredit',
          'credit',
          'pinjaman',
          'loan',
          'asuransi',
          'insurance',
          'pensiun',
          'retirement',
          'dana darurat',
          'emergency fund',
          'inflasi',
          'inflation',
          'bunga',
          'interest',
          'return',
          'keuntungan',
          'rugi',
          'loss',
          'profit',
          'dividen',
          'dividend',
          'portfolio',
          'diversifikasi',
          'diversification',
          'risk',
          'risiko',
          'volatilitas',
          'trading',
          'beli',
          'jual',
          'harga',
          'price',
          'nilai',
          'value',
          'analisis',
          'analysis',
          'prediksi',
          'forecast',
          'trend',
          'tren',
          'market',
          'pasar',
          'ekonomi',
          'economic',
          'reksadana',
          'mutual fund',
          'etf',
          'index',
          'indeks',
          'bonds',
          'sukuk',
          'deposito',
          'deposit',
          'giro',
          'current account',
          'kartu kredit',
          'credit card',
          'cicilan',
          'installment',
          'kpr',
          'mortgage',
          'leasing',
          'sewa',
          'rent',
          'biaya',
          'cost',
          'fee',
          'komisi',
          'commission',
        ];

        const isFinancialQuestion = financialKeywords.some((keyword) =>
          text.toLowerCase().includes(keyword.toLowerCase()),
        );

        if (isFinancialQuestion) {
          // Send custom financial question to AI
          response = await requestAI({
            type: 'custom-financial-advice',
            message: text,
          });
        } else {
          // Not a financial question, show guidance
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'system',
            content:
              'Saya hanya dapat membantu dengan pertanyaan seputar keuangan dan investasi. Silakan gunakan template di samping atau tanyakan tentang: analisis keuangan, investasi, tabungan, budget, atau topik keuangan lainnya.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setInputText('');
          setIsProcessing(false);
          return;
        }
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          response.message ||
          `Berhasil mendapatkan respons dari ${response.model} AI`,
        data: response.data,
        timestamp: new Date(),
        model: response.model,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('❌ AI request failed:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.role === 'system') {
      return (
        <div
          key={message.id}
          className="text-xs text-muted-foreground text-center"
        >
          {message.content}
        </div>
      );
    }

    if (message.role === 'user') {
      return (
        <div key={message.id} className="flex items-end gap-2 justify-end">
          <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow break-words whitespace-pre-wrap">
            {message.content}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      );
    }

    // Assistant message
    return (
      <div key={message.id} className="flex items-start gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[90%] rounded-2xl border bg-muted/40 px-4 py-3 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">AI Assistant</div>
            <div className="flex items-center gap-2">
              {message.model && (
                <Badge variant="outline" className="text-xs">
                  {message.model}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <div className="text-muted-foreground">{message.content}</div>

          {message.data && message.data.length > 0 && (
            <div className="space-y-2">
              {message.data.map((item: any, index: number) => {
                // Handle dashboard data structure
                if (item.insights || item.recommendations) {
                  return (
                    <div key={index} className="space-y-3">
                      {/* Insights Section */}
                      {item.insights && item.insights.length > 0 && (
                        <div>
                          <div className="font-medium mb-2 text-primary">
                            📊 AI Insights
                          </div>
                          <div className="space-y-2">
                            {item.insights.map((insight: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 border rounded bg-background"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">
                                    {insight.title || 'AI Insight'}
                                  </div>
                                  {insight.priority && (
                                    <Badge variant="outline">
                                      {insight.priority}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                                  {insight.message ||
                                    'Tidak ada pesan tersedia'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations Section */}
                      {item.recommendations &&
                        item.recommendations.length > 0 && (
                          <div>
                            <div className="font-medium mb-2 text-primary">
                              💡 AI Recommendations
                            </div>
                            <div className="space-y-2">
                              {item.recommendations.map(
                                (rec: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-3 border rounded bg-background"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-medium">
                                        {rec.title || 'AI Recommendation'}
                                      </div>
                                      {rec.priority && (
                                        <Badge variant="outline">
                                          {rec.priority}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                                      {rec.message ||
                                        'Tidak ada pesan tersedia'}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Statistics */}
                      {item.statistics && (
                        <div className="p-3 border rounded bg-muted/30">
                          <div className="font-medium mb-2">📈 Statistics</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-semibold">
                                {item.statistics.totalInsights}
                              </div>
                              <div className="text-muted-foreground">
                                Insights
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">
                                {item.statistics.totalRecommendations}
                              </div>
                              <div className="text-muted-foreground">
                                Recommendations
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">
                                {item.statistics.unreadRecommendations}
                              </div>
                              <div className="text-muted-foreground">
                                Unread
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle direct insights/recommendations array
                return (
                  <div key={index} className="p-3 border rounded bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {item.title || 'AI Insight'}
                      </div>
                      {item.priority && (
                        <Badge variant="outline">{item.priority}</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                      {item.message || 'Tidak ada pesan tersedia'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">AI Chat (Real-time)</h3>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="model-switch" className="text-xs">
                {currentModel === 'deepseek' ? 'DeepSeek' : 'Gemini'}
              </Label>
              <Switch
                id="model-switch"
                checked={currentModel === 'gemini'}
                onCheckedChange={(checked) =>
                  switchModel(checked ? 'gemini' : 'deepseek')
                }
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
            {messages.map(renderMessage)}

            {isProcessing && (
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-2xl border bg-muted/40 px-3 py-2 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    <span className="ml-2 text-xs">
                      Menggunakan {currentModel} AI...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-2">AI Templates</div>
          <div className="grid gap-2">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.id}
                  variant="secondary"
                  className="justify-start rounded-2xl w-full text-left whitespace-normal break-words"
                  onClick={() => handleTemplateClick(t.id)}
                  disabled={isProcessing || !isConnected}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {t.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            <div className="mb-2">Status Koneksi:</div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Terhubung ke AI</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Terputus</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <div>Contoh pertanyaan yang bisa ditanyakan:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>"Bagaimana cara investasi yang aman untuk pemula?"</li>
              <li>
                "Apakah reksadana atau saham lebih baik untuk jangka panjang?"
              </li>
              <li>"Berapa persen gaji yang ideal untuk tabungan?"</li>
              <li>"Cara mengatur budget bulanan yang efektif"</li>
              <li>
                "Analisis pengeluaran dan kategori boros 30 hari terakhir"
              </li>
              <li>"Rekomendasi penghematan untuk menambah tabungan"</li>
              <li>"Bagaimana cara diversifikasi portfolio investasi?"</li>
              <li>"Tips mengelola hutang dan cicilan"</li>
            </ul>
          </div>

          <Separator className="my-3" />
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            disabled={isProcessing}
            onClick={() =>
              setMessages([
                {
                  id: '1',
                  role: 'system',
                  content:
                    'Selamat datang! Anda bisa bertanya bebas tentang keuangan dan investasi, atau gunakan template di samping untuk analisis data keuangan Anda. Chat ini menggunakan Socket.IO untuk komunikasi real-time.',
                  timestamp: new Date(),
                },
              ])
            }
          >
            Reset Percakapan
          </Button>
        </CardContent>
      </Card>

      {/* Input bar */}
      <div className="lg:col-span-3">
        <div className="flex gap-2">
          <Input
            placeholder="Tanyakan tentang keuangan, investasi, atau gunakan template..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isProcessing || !isConnected}
          />
          <Button
            onClick={handleSend}
            disabled={isProcessing || !inputText.trim() || !isConnected}
          >
            Kirim
          </Button>
        </div>
      </div>
    </div>
  );
}
