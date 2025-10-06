import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '../../hooks/use-toast';
import { useScrollLock } from '../../hooks/use-scroll-lock';
import { Progress } from '../ui/progress';
import {
  Check,
  Target,
  DollarSign,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  TrendingUp,
  Wallet,
  Heart,
  Zap,
} from 'lucide-react';

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onComplete: (data: ProfileData) => void;
  onSkip?: () => void;
}

interface ProfileData {
  interests: string[];
  incomeRange: string;
  expenseCategories: string[];
}

const INTERESTS = [
  {
    id: 'saham',
    label: 'Investasi Saham',
    icon: TrendingUp,
    description: 'Portfolio saham untuk pertumbuhan jangka panjang',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'reksadana',
    label: 'Investasi Reksadana',
    icon: Wallet,
    description: 'Investasi terkelola dengan risiko rendah',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'emas',
    label: 'Investasi Emas',
    icon: Star,
    description: 'Safe haven untuk melindungi nilai aset',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  {
    id: 'properti',
    label: 'Investasi Properti',
    icon: Target,
    description: 'Investasi real estate untuk passive income',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'forex',
    label: 'Trading Forex',
    icon: Zap,
    description: 'Trading mata uang dengan volatilitas tinggi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    id: 'crypto',
    label: 'Trading Crypto',
    icon: Sparkles,
    description: 'Investasi cryptocurrency dan blockchain',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
  },
  {
    id: 'tabungan',
    label: 'Tabungan',
    icon: Wallet,
    description: 'Tabungan konvensional dan deposito',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
  },
  {
    id: 'asuransi',
    label: 'Asuransi',
    icon: Heart,
    description: 'Perlindungan finansial dan kesehatan',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
  {
    id: 'pensiun',
    label: 'Pensiun',
    icon: Target,
    description: 'Perencanaan dana pensiun dan masa depan',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-950',
  },
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: Star,
    description: 'Investasi untuk pendidikan dan skill development',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    id: 'bisnis',
    label: 'Bisnis',
    icon: TrendingUp,
    description: 'Investasi dalam bisnis dan wirausaha',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    id: 'lainnya',
    label: 'Lainnya',
    icon: Sparkles,
    description: 'Minat investasi lainnya yang tidak tercantum',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
  },
];

const INCOME_RANGES = [
  {
    value: '0-5jt',
    label: 'Rp 0 - 5 juta',
    description: 'Fresh graduate atau entry level',
    icon: '🌱',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    value: '5-10jt',
    label: 'Rp 5 - 10 juta',
    description: 'Professional dengan pengalaman 1-3 tahun',
    icon: '💼',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    value: '10-20jt',
    label: 'Rp 10 - 20 juta',
    description: 'Senior professional atau manager',
    icon: '🚀',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    value: '20-50jt',
    label: 'Rp 20 - 50 juta',
    description: 'Executive atau business owner',
    icon: '👑',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  {
    value: '50jt+',
    label: 'Rp 50 juta+',
    description: 'High net worth individual',
    icon: '💎',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
  },
];

const EXPENSE_CATEGORIES = [
  {
    id: 'makanan',
    label: 'Makanan & Minuman',
    icon: '🍽️',
    description: 'Makan di rumah, restoran, dan minuman',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    id: 'transportasi',
    label: 'Transportasi',
    icon: '🚗',
    description: 'Bensin, transportasi umum, dan maintenance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'belanja',
    label: 'Belanja',
    icon: '🛍️',
    description: 'Pakaian, elektronik, dan kebutuhan sehari-hari',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
  },
  {
    id: 'hiburan',
    label: 'Hiburan',
    icon: '🎬',
    description: 'Film, game, streaming, dan rekreasi',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: '🏥',
    description: 'Obat, dokter, gym, dan asuransi kesehatan',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: '📚',
    description: 'Kursus, buku, dan pengembangan diri',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'tagihan',
    label: 'Tagihan',
    icon: '⚡',
    description: 'Listrik, air, internet, dan telepon',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  {
    id: 'investasi',
    label: 'Investasi',
    icon: '📈',
    description: 'Saham, reksadana, dan instrumen investasi',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
  },
];

export function ProfileCompletionWizard({
  isOpen,
  onComplete,
  onSkip,
}: ProfileCompletionWizardProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [incomeRange, setIncomeRange] = useState<string>('');
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const steps = [
    {
      id: 1,
      title: 'Minat Investasi',
      description: 'Pilih minat investasi Anda',
      icon: Target,
      color: 'text-primary',
    },
    {
      id: 2,
      title: 'Range Penghasilan',
      description: 'Berapa range penghasilan Anda?',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      id: 3,
      title: 'Kategori Pengeluaran',
      description: 'Pilih kategori pengeluaran Anda',
      icon: ShoppingCart,
      color: 'text-warning',
    },
  ];

  const progress = (currentStep / steps.length) * 100;

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interestId]);
    } else {
      setInterests(interests.filter((i) => i !== interestId));
    }
  };

  const handleExpenseCategoryChange = (
    categoryId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setExpenseCategories([...expenseCategories, categoryId]);
    } else {
      setExpenseCategories(expenseCategories.filter((c) => c !== categoryId));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSubmit = async () => {
    if (
      interests.length === 0 ||
      !incomeRange ||
      expenseCategories.length === 0
    ) {
      toast({
        title: 'Data Belum Lengkap',
        description: 'Mohon lengkapi semua informasi yang diperlukan',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onComplete({ interests, incomeRange, expenseCategories });
      toast({
        title: 'Profil Berhasil Diselesaikan!',
        description: 'Terima kasih telah melengkapi profil Anda',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan profil. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return interests.length > 0;
      case 2:
        return incomeRange !== '';
      case 3:
        return expenseCategories.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div
            className={`space-y-6 transition-all duration-300 ${
              isAnimating
                ? 'opacity-0 translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Apa Minat Investasi Anda?
              </h3>
              <p className="text-muted-foreground">
                Pilih semua yang sesuai dengan minat Anda untuk rekomendasi yang
                lebih personal
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERESTS.map((interest, index) => (
                <div
                  key={interest.id}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-100 hover:shadow-lg ${
                    interests.includes(interest.id)
                      ? 'border-primary bg-primary/5 shadow-md scale-100'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() =>
                    handleInterestChange(
                      interest.id,
                      !interests.includes(interest.id),
                    )
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${interest.bgColor} flex items-center justify-center`}
                    >
                      <interest.icon className={`h-5 w-5 ${interest.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Checkbox
                        checked={interests.includes(interest.id)}
                        className="hidden"
                        onChange={() =>
                          handleInterestChange(
                            interest.id,
                            !interests.includes(interest.id),
                          )
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">
                          {interest.label}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {interest.description}
                      </p>
                    </div>
                  </div>
                  {interests.includes(interest.id) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-black" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div
            className={`space-y-6 transition-all duration-300 ${
              isAnimating
                ? 'opacity-0 translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                Berapa Range Penghasilan Anda?
              </h3>
              <p className="text-muted-foreground">
                Informasi ini membantu kami memberikan rekomendasi investasi
                yang tepat
              </p>
            </div>
            <RadioGroup value={incomeRange} onValueChange={setIncomeRange}>
              <div className="space-y-4">
                {INCOME_RANGES.map((range, index) => (
                  <div
                    key={range.value}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-100 hover:shadow-lg ${
                      incomeRange === range.value
                        ? 'border-success bg-success/5 shadow-md scale-100'
                        : 'border-border hover:border-success/50'
                    }`}
                    onClick={() => setIncomeRange(range.value)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{range.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={range.value}
                            id={range.value}
                          />
                          <Label
                            htmlFor={range.value}
                            className="text-sm font-semibold cursor-pointer"
                          >
                            {range.label}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {range.description}
                        </p>
                      </div>
                    </div>
                    {incomeRange === range.value && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div
            className={`space-y-6 transition-all duration-300 ${
              isAnimating
                ? 'opacity-0 translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent">
                Kategori Pengeluaran Anda
              </h3>
              <p className="text-muted-foreground">
                Pilih kategori yang sesuai dengan pengeluaran Anda untuk
                analisis yang lebih akurat
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPENSE_CATEGORIES.map((category, index) => (
                <div
                  key={category.id}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-100 hover:shadow-lg ${
                    expenseCategories.includes(category.id)
                      ? 'border-warning bg-warning/5 shadow-md scale-100'
                      : 'border-border hover:border-warning/50'
                  }`}
                  onClick={() =>
                    handleExpenseCategoryChange(
                      category.id,
                      !expenseCategories.includes(category.id),
                    )
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}
                    >
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={expenseCategories.includes(category.id)}
                          onChange={() =>
                            handleExpenseCategoryChange(
                              category.id,
                              !expenseCategories.includes(category.id),
                            )
                          }
                        />
                        <h4 className="font-semibold text-sm">
                          {category.label}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {expenseCategories.includes(category.id) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5"></div>
      <Card className="relative w-full max-w-4xl shadow-2xl border-0 bg-background/95 backdrop-blur-xl">
        <CardHeader className="text-center space-y-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white dark:text-black rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                {currentStep}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text">
                Lengkapi Profil Anda
              </h2>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-primary font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3 bg-muted" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full"></div>
            </div>
            <div className="flex justify-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index + 1 <= currentStep
                      ? 'bg-primary scale-125'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {renderStepContent()}

          <div className="flex justify-between items-center pt-8 border-t border-border/50">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="group hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Sebelumnya
                </Button>
              )}
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Lewati
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="group bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Selesai
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
