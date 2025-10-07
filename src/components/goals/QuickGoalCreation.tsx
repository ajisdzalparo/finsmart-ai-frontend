import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target, PiggyBank, Car, Home, GraduationCap, Heart, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuickGoalCreationProps {
  onGoalCreate: (goalData: any) => void;
  onClose: () => void;
}

const GOAL_TEMPLATES = [
  {
    id: 'emergency',
    name: 'Dana Darurat',
    icon: PiggyBank,
    targetAmount: 10000000,
    description: 'Tabungan untuk situasi darurat',
    color: 'bg-red-500',
    suggestedAmount: 10000000,
    timeframe: '12 months'
  },
  {
    id: 'vacation',
    name: 'Liburan',
    icon: Plane,
    targetAmount: 15000000,
    description: 'Tabungan untuk liburan impian',
    color: 'bg-blue-500',
    suggestedAmount: 15000000,
    timeframe: '6 months'
  },
  {
    id: 'car',
    name: 'Mobil',
    icon: Car,
    targetAmount: 200000000,
    description: 'Tabungan untuk membeli mobil',
    color: 'bg-gray-500',
    suggestedAmount: 200000000,
    timeframe: '24 months'
  },
  {
    id: 'house',
    name: 'Rumah',
    icon: Home,
    targetAmount: 500000000,
    description: 'Tabungan untuk DP rumah',
    color: 'bg-green-500',
    suggestedAmount: 500000000,
    timeframe: '36 months'
  },
  {
    id: 'education',
    name: 'Pendidikan',
    icon: GraduationCap,
    targetAmount: 50000000,
    description: 'Tabungan untuk pendidikan',
    color: 'bg-purple-500',
    suggestedAmount: 50000000,
    timeframe: '18 months'
  },
  {
    id: 'wedding',
    name: 'Pernikahan',
    icon: Heart,
    targetAmount: 100000000,
    description: 'Tabungan untuk pernikahan',
    color: 'bg-pink-500',
    suggestedAmount: 100000000,
    timeframe: '24 months'
  }
];

export function QuickGoalCreation({ onGoalCreate, onClose }: QuickGoalCreationProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState({
    name: '',
    targetAmount: 0,
    targetDate: undefined as Date | undefined,
    goalType: 'savings'
  });
  const [step, setStep] = useState<'template' | 'custom' | 'details'>('template');

  const handleTemplateSelect = (templateId: string) => {
    const template = GOAL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomGoal({
        name: template.name,
        targetAmount: template.suggestedAmount,
        targetDate: new Date(Date.now() + (parseInt(template.timeframe) * 30 * 24 * 60 * 60 * 1000)),
        goalType: 'savings'
      });
      setSelectedTemplate(templateId);
      setStep('details');
    }
  };

  const handleCustomGoal = () => {
    setStep('custom');
    setSelectedTemplate(null);
  };

  const handleCreateGoal = () => {
    const goalData = {
      ...customGoal,
      targetDate: customGoal.targetDate?.toISOString(),
      currentAmount: 0,
      isActive: true
    };
    onGoalCreate(goalData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Template Selection */}
      {step === 'template' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Pilih Template Goal</h3>
            <p className="text-muted-foreground">Pilih dari template yang sudah tersedia atau buat custom</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GOAL_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${template.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {formatCurrency(template.suggestedAmount)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={handleCustomGoal}>
              <Target className="w-4 h-4 mr-2" />
              Buat Goal Custom
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Custom Goal Form */}
      {step === 'custom' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Buat Goal Custom</h3>
            <p className="text-muted-foreground">Tentukan goal finansial Anda</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">Nama Goal</Label>
              <Input
                id="goalName"
                placeholder="Contoh: Tabungan untuk laptop baru"
                value={customGoal.name}
                onChange={(e) => setCustomGoal(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="10000000"
                value={customGoal.targetAmount || ''}
                onChange={(e) => setCustomGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
              />
              {customGoal.targetAmount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(customGoal.targetAmount)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="goalType">Tipe Goal</Label>
              <Select 
                value={customGoal.goalType} 
                onValueChange={(value) => setCustomGoal(prev => ({ ...prev, goalType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Tabungan</SelectItem>
                  <SelectItem value="investment">Investasi</SelectItem>
                  <SelectItem value="debt">Pelunasan Hutang</SelectItem>
                  <SelectItem value="purchase">Pembelian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('template')}>
              Kembali
            </Button>
            <Button 
              onClick={() => setStep('details')}
              disabled={!customGoal.name || !customGoal.targetAmount}
            >
              Lanjut
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Goal Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Detail Goal</h3>
            <p className="text-muted-foreground">Lengkapi informasi goal Anda</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Nama Goal</Label>
              <Input value={customGoal.name} readOnly />
            </div>

            <div>
              <Label>Target Amount</Label>
              <Input 
                type="number"
                value={customGoal.targetAmount}
                onChange={(e) => setCustomGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(customGoal.targetAmount)}
              </p>
            </div>

            <div>
              <Label>Target Date (Opsional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customGoal.targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customGoal.targetDate ? format(customGoal.targetDate, "PPP") : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customGoal.targetDate}
                    onSelect={(date) => setCustomGoal(prev => ({ ...prev, targetDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Template yang dipilih:</h4>
                <p className="text-sm text-muted-foreground">
                  {GOAL_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(selectedTemplate ? 'template' : 'custom')}>
              Kembali
            </Button>
            <Button onClick={handleCreateGoal}>
              Buat Goal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
