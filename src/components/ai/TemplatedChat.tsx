/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  aiApi,
  type AIInsight,
  type AIRecommendation,
  type AIDashboard,
} from '@/api/ai';
import { Lightbulb, Sparkles, LayoutGrid, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type AssistantPayload =
  | { kind: 'insights'; data: AIInsight[] }
  | { kind: 'recommendations'; data: AIRecommendation[] }
  | { kind: 'dashboard'; data: AIDashboard };

type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; payload: AssistantPayload }
  | { role: 'system'; content: string };

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
    run: async (): Promise<AssistantPayload> => {
      try {
        console.log('Fetching insights...');
        const insights = await aiApi.previewInsights();
        console.log('Fetched insights:', insights);
        return {
          kind: 'insights',
          data: insights as unknown as AIInsight[],
        };
      } catch (error) {
        console.error('Error fetching insights:', error);
        return {
          kind: 'insights',
          data: [],
        };
      }
    },
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
    run: async (): Promise<AssistantPayload> => ({
      kind: 'recommendations',
      data: (await aiApi.previewRecommendations()) as unknown as AIRecommendation[],
    }),
  },
  {
    id: 'dashboard',
    label: 'Ringkas dashboard AI',
    description:
      'Ringkasan cepat: jumlah insight, rekomendasi belum dibaca, dan highlight terbaru.',
    keywords: ['dashboard', 'ringkas', 'statistik', 'resume', 'ikhtisar'],
    icon: LayoutGrid,
    run: async (): Promise<AssistantPayload> => ({
      kind: 'dashboard',
      data: await aiApi.getAIDashboard(),
    }),
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
    run: async (): Promise<AssistantPayload> => ({
      kind: 'recommendations',
      data: (await aiApi.previewRecommendations()) as unknown as AIRecommendation[],
    }),
  },
  {
    id: 'goals',
    label: 'Cek progres goals & percepatan',
    description:
      'Tampilkan progres pencapaian goals utama dan saran percepatan (top-up, penjadwalan ulang).',
    keywords: ['goal', 'progres', 'target', 'percepatan', 'tujuan'],
    icon: Lightbulb,
    run: async (): Promise<AssistantPayload> => ({
      kind: 'insights',
      data: (await aiApi.previewInsights()) as unknown as AIInsight[],
    }),
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
    run: async (): Promise<AssistantPayload> => ({
      kind: 'insights',
      data: (await aiApi.previewInsights()) as unknown as AIInsight[],
    }),
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
    run: async (): Promise<AssistantPayload> => ({
      kind: 'dashboard',
      data: await aiApi.getAIDashboard(),
    }),
  },
];

export default function TemplatedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content:
        'Pilih salah satu template di bawah untuk mulai percakapan. Chat ini hanya menerima template, bukan input bebas.',
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleTemplateClick = async (tplId: string) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    console.log('Running template:', tplId);
    setIsRunning(true);
    setMessages((prev) => [...prev, { role: 'user', content: tpl.label }]);
    try {
      const payload = await tpl.run();
      console.log('Template result:', payload);
      setMessages((prev) => [...prev, { role: 'assistant', payload }]);
    } catch (e) {
      console.error('Template error:', e);
      // Fallback: tampilkan data tersimpan jika preview gagal
      try {
        if (tplId === 'insights' || tplId === 'goals' || tplId === 'anomaly') {
          const stored = (await aiApi.getInsights()) as unknown as AIInsight[];
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', payload: { kind: 'insights', data: stored } },
          ]);
        } else if (tplId === 'recommendations' || tplId === 'overspend') {
          const stored =
            (await aiApi.getRecommendations()) as unknown as AIRecommendation[];
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              payload: { kind: 'recommendations', data: stored },
            },
          ]);
        } else if (tplId === 'dashboard' || tplId === 'subscriptions') {
          const dash = await aiApi.getAIDashboard();
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', payload: { kind: 'dashboard', data: dash } },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'system', content: 'Gagal memproses permintaan AI.' },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Gagal memproses permintaan AI.' },
        ]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const resolveTemplateByText = (text: string) => {
    const t = text.toLowerCase();
    return (
      templates.find((tpl) =>
        tpl.keywords?.some((k: string) => t.includes(k)),
      ) || null
    );
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInputText('');
    const matched = resolveTemplateByText(text);
    if (!matched) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content:
            'Gunakan salah satu template atau ketik kata kunci seperti: "analisis", "hemat", "dashboard", "boros 30 hari", "goal", "langganan".',
        },
      ]);
      return;
    }
    await handleTemplateClick(matched.id);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
            {messages.map((m, idx) => {
              if (m.role === 'system') {
                return (
                  <div
                    key={idx}
                    className="text-xs text-muted-foreground text-center"
                  >
                    {m.content}
                  </div>
                );
              }
              if (m.role === 'user') {
                return (
                  <div key={idx} className="flex items-end gap-2 justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow break-words whitespace-pre-wrap">
                      {m.content}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                );
              }
              // assistant
              const p = m.payload;
              if (p.kind === 'insights') {
                console.log('Rendering insights:', p.data);
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[90%] rounded-2xl border bg-muted/40 px-4 py-3 text-sm space-y-2">
                      <div className="font-medium">AI Insights</div>
                      {p.data && p.data.length > 0 ? (
                        p.data.map((it: any, index: number) => (
                          <div
                            key={it.id || index}
                            className="p-2 border rounded bg-background"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">
                                {it.title || 'AI Insight'}
                              </div>
                              <Badge variant="outline">
                                {it.priority || 'medium'}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                              {it.message || 'Tidak ada pesan tersedia'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 border rounded bg-background text-muted-foreground">
                          <div className="font-medium">
                            Tidak ada insights tersedia
                          </div>
                          <div className="text-sm">
                            Coba generate insights baru atau periksa data
                            transaksi Anda.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              if (p.kind === 'recommendations') {
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[90%] rounded-2xl border bg-muted/40 px-4 py-3 text-sm space-y-2">
                      <div className="font-medium">AI Recommendations</div>
                      {p.data.map((it) => (
                        <div
                          key={it.id}
                          className="p-2 border rounded bg-background"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{it.title}</div>
                            <Badge variant="secondary">{it.priority}</Badge>
                          </div>
                          <div className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                            {it.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              // dashboard
              return (
                <div key={idx} className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[90%] rounded-2xl border bg-muted/40 px-4 py-3 text-sm space-y-2">
                    <div className="font-medium">AI Dashboard Ringkas</div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="p-2 border rounded bg-background">
                        Total insights: {p.data.statistics.totalInsights}
                      </div>
                      <div className="p-2 border rounded bg-background">
                        Rekomendasi: {p.data.statistics.totalRecommendations}
                      </div>
                      <div className="p-2 border rounded bg-background">
                        Belum dibaca: {p.data.statistics.unreadRecommendations}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isRunning && (
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-2">Template</div>
          <div className="grid gap-2">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.id}
                  variant="secondary"
                  className="justify-start rounded-2xl w-full text-left whitespace-normal break-words"
                  onClick={() => handleTemplateClick(t.id)}
                  disabled={isRunning}
                >
                  <Icon className="h-4 w-4 mr-2" /> {t.label}
                </Button>
              );
            })}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div>Contoh instruksi akurat:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                "analisis pengeluaran dan kategori boros 30 hari terakhir"
              </li>
              <li>"rekomendasi penghematan untuk menambah tabungan bulanan"</li>
              <li>"ringkas dashboard AI dan item belum dibaca"</li>
              <li>"cek progres goals dan saran percepatan"</li>
              <li>"deteksi transaksi tidak biasa untuk ditinjau"</li>
            </ul>
          </div>
          <Separator className="my-3" />
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            disabled={isRunning}
            onClick={() =>
              setMessages([
                {
                  role: 'system',
                  content:
                    messages[0]?.role === 'system'
                      ? messages[0].content
                      : 'Mulai lagi dengan memilih template.',
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
            placeholder="Ketik instruksi (akan dipetakan ke template)…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isRunning || !inputText.trim()}
          >
            Kirim
          </Button>
        </div>
      </div>
    </div>
  );
}
