import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Bell,
  Shield,
  Globe,
  Download,
  Target,
  DollarSign,
  Settings as SettingsIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSettings } from '@/context/SettingsContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCategoriesQuery } from '@/api/categories';
import {
  useCompleteProfileMutation,
  useUpdateNameMutation,
  useChangePasswordMutation,
  getAuthToken,
} from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPopup from '@/components/subscription/SubscriptionPopup';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  useCurrentSubscriptionQuery,
  useSubscriptionPlansQuery,
} from '@/api/subscription';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, X } from 'lucide-react';
import { useCurrencyFormatter } from '@/lib/currency';
import FeatureGate from '@/components/subscription/FeatureGate';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PlanFeatures from '@/components/subscription/PlanFeatures';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import DisabledFeature from '@/components/subscription/DisabledFeature';
import FeatureBadge from '@/components/subscription/FeatureBadge';

// Standardized to IDR only, but keeping other options commented for future use
type CurrencyCode = 'IDR';
// type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategoriesQuery();
  const { data: currentSubscription, isLoading: isLoadingSubscription } =
    useCurrentSubscriptionQuery();
  const { data: availablePlans, isLoading: isLoadingPlans } =
    useSubscriptionPlansQuery();
  const { format } = useCurrencyFormatter();
  const completeProfileMutation = useCompleteProfileMutation();
  const updateNameMutation = useUpdateNameMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const { hasAccess, getPlanFeatures } = useFeatureAccess();

  // Cek apakah user memiliki akses ke fitur premium berdasarkan database
  const hasAIModelAccess = hasAccess('ai_model_selection', 'premium');
  const hasTimezoneAccess = hasAccess('timezone_selection', 'premium');
  const hasExportAccess = hasAccess('data_export', 'premium');
  const hasTwoFactorAccess = hasAccess('two_factor_auth', 'premium');
  const hasGoalRemindersAccess = hasAccess('goal_reminders', 'premium');
  const hasBudgetAlertsAccess = hasAccess('budget_alerts', 'premium');
  const {
    currency,
    setCurrency,
    locale,
    setLocale,
    aiModel,
    setAIModel,
    timeZone,
    setTimeZone,
    notificationEmail,
    setNotificationEmail,
    notificationPush,
    setNotificationPush,
    notificationGoalReminders,
    setNotificationGoalReminders,
    notificationBudgetAlerts,
    setNotificationBudgetAlerts,
  } = useSettings();

  // Profile completion state
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [incomeRange, setIncomeRange] = useState<string>(
    user?.incomeRange || '',
  );
  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    user?.expenseCategories || [],
  );
  const [newName, setNewName] = useState<string>(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  // Helper functions for subscription display
  const getPlanDisplayName = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'Free Plan';
      case 'basic':
        return 'Basic Plan';
      case 'premium':
        return 'Premium Plan';
      case 'pro':
        return 'Pro Plan';
      default:
        return planName;
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return '🆓';
      case 'basic':
        return '⭐';
      case 'premium':
        return '👑';
      case 'pro':
        return '💎';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'expired':
        return 'Kedaluwarsa';
      case 'cancelled':
        return 'Dibatalkan';
      case 'pending':
        return 'Menunggu';
      default:
        return 'Tidak Diketahui';
    }
  };

  const availableInterests = [
    'Investasi Saham',
    'Trading Forex',
    'Investasi Emas',
    'Tabungan',
    'Reksadana',
    'Obligasi',
    'Cryptocurrency',
    'Properti',
  ];

  const availableExpenseCategories = (categories || [])
    .filter((c) => c.type === 'expense' && !c.isDeleted)
    .map((c) => c.name);

  // Inisialisasi default saat user baru: jika belum ada expenseCategories disimpan,
  // gunakan semua kategori expense yang tersedia dari API
  // Pindahkan ke useEffect untuk menghindari side effect di render
  useEffect(() => {
    if (
      expenseCategories.length === 0 &&
      availableExpenseCategories.length > 0 &&
      (user?.expenseCategories === undefined ||
        (user?.expenseCategories || []).length === 0)
    ) {
      setExpenseCategories(availableExpenseCategories);
    }
  }, [
    availableExpenseCategories,
    user?.expenseCategories,
    expenseCategories.length,
  ]);

  const incomeRanges = [
    'Rp 0 - 5 juta',
    'Rp 5 - 10 juta',
    'Rp 10 - 20 juta',
    'Rp 20 - 50 juta',
    'Rp 50 juta+',
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interest]);
    } else {
      setInterests(interests.filter((i) => i !== interest));
    }
  };

  const handleExpenseCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setExpenseCategories([...expenseCategories, category]);
    } else {
      setExpenseCategories(expenseCategories.filter((c) => c !== category));
    }
  };

  const handleCompleteProfile = async () => {
    // Validasi user sudah login
    if (!user || !getAuthToken()) {
      toast({
        title: 'Error',
        description: 'Anda harus login terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    // Validasi data sebelum mengirim
    if (interests.length === 0) {
      toast({
        title: 'Error',
        description: 'Pilih minimal satu minat investasi',
        variant: 'destructive',
      });
      return;
    }

    if (!incomeRange || incomeRange.trim() === '') {
      toast({
        title: 'Error',
        description: 'Pilih range penghasilan Anda',
        variant: 'destructive',
      });
      return;
    }

    if (expenseCategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Pilih minimal satu kategori pengeluaran',
        variant: 'destructive',
      });
      return;
    }

    console.log('Data yang akan dikirim:', {
      interests,
      incomeRange,
      expenseCategories,
    });

    // Debug: Periksa apakah user dan token tersedia
    console.log('User data:', user);
    console.log('Token available:', !!getAuthToken());

    try {
      await completeProfileMutation.mutateAsync({
        interests,
        incomeRange,
        expenseCategories,
      });
      toast({
        title: 'Berhasil',
        description: 'Profil Anda telah diperbarui',
      });
      // Refresh halaman untuk update data user
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error updating profile:', error);

      // Tampilkan error message yang lebih spesifik
      let errorMessage = 'Gagal memperbarui profil. Silakan coba lagi.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { error?: unknown } };
        };
        const backendError = axiosError.response?.data?.error;
        if (typeof backendError === 'object' && backendError !== null) {
          // Handle validation errors from Zod
          const errorMessages = [];
          const zodError = backendError as Record<
            string,
            { _errors?: string[] }
          >;

          if (zodError.interests?._errors?.[0])
            errorMessages.push(
              'Minat investasi: ' + zodError.interests._errors[0],
            );
          if (zodError.incomeRange?._errors?.[0])
            errorMessages.push(
              'Range penghasilan: ' + zodError.incomeRange._errors[0],
            );
          if (zodError.expenseCategories?._errors?.[0])
            errorMessages.push(
              'Kategori pengeluaran: ' + zodError.expenseCategories._errors[0],
            );

          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        } else if (typeof backendError === 'string') {
          errorMessage = backendError;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateNameMutation.mutateAsync({ name: newName });
      toast({ title: 'Berhasil', description: 'Nama berhasil diperbarui' });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui nama',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Konfirmasi password tidak cocok',
        variant: 'destructive',
      });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast({ title: 'Berhasil', description: 'Password berhasil diganti' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Gagal mengganti password',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    try {
      const rows: string[][] = [];

      const pushSection = (title: string) => {
        rows.push([title]);
      };
      const pushKv = (key: string, value: unknown) => {
        const v = Array.isArray(value) ? value.join('; ') : String(value ?? '');
        rows.push([key, v]);
      };

      pushSection('User');
      pushKv('name', user?.name ?? '');
      pushKv('email', user?.email ?? '');
      pushKv('profileCompleted', user?.profileCompleted ?? false);
      pushKv('interests', user?.interests ?? []);
      pushKv('incomeRange', user?.incomeRange ?? '');
      pushKv('expenseCategories', expenseCategories);
      rows.push(['']);

      pushSection('Settings');
      pushKv('currency', currency);
      pushKv('locale', locale);
      pushKv('aiModel', aiModel);
      pushKv('timeZone', timeZone);
      pushKv('notificationEmail', notificationEmail);
      pushKv('notificationPush', notificationPush);
      pushKv('notificationGoalReminders', notificationGoalReminders);
      pushKv('notificationBudgetAlerts', notificationBudgetAlerts);

      const escapeCell = (cell: string) => {
        const needsQuote = /[",\n]/.test(cell);
        const escaped = cell.replace(/"/g, '""');
        return needsQuote ? `"${escaped}"` : escaped;
      };

      const csvBody = rows
        .map((r) => r.map((c) => escapeCell(String(c))).join(','))
        .join('\n');
      const bom = '\uFEFF'; // BOM agar Excel membaca UTF-8 dengan benar
      const blob = new Blob([bom + csvBody], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finsmart-export-${new Date()
        .toISOString()
        .slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Berhasil',
        description: 'Data Excel (CSV) berhasil diekspor',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        className="bg-background border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Kelola preferensi akun dan pengaturan aplikasi Anda
                </p>
              </div>
            </div>
            {/* Subscription Status */}
            {currentSubscription && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Badge
                  variant={
                    currentSubscription.status === 'active'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-sm px-4 py-2 shadow-md"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {getPlanDisplayName(currentSubscription.plan.name)} -{' '}
                  {getStatusText(currentSubscription.status)}
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Plan Features Overview */}
          <PlanFeatures />

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Profile Settings */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span>Informasi Profil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="text-sm p-2 rounded border bg-muted/20 break-all">
                    {user?.email || '-'}
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleUpdateName}
                  disabled={updateNameMutation.isPending}
                >
                  {updateNameMutation.isPending
                    ? 'Menyimpan...'
                    : 'Perbarui Nama'}
                </Button>
              </CardContent>
            </Card>

            {/* Financial Profile */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <Target className="h-5 w-5" />
                  </div>
                  <span>Profil Keuangan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interests */}
                <div className="space-y-3">
                  <Label>Minat Investasi</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableInterests.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={interest}
                          checked={interests.includes(interest)}
                          onCheckedChange={(checked) =>
                            handleInterestChange(interest, checked as boolean)
                          }
                        />
                        <Label htmlFor={interest} className="text-sm">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income Range */}
                <div className="space-y-2">
                  <Label htmlFor="income">Range Penghasilan</Label>
                  <Select value={incomeRange} onValueChange={setIncomeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih range penghasilan" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expense Categories */}
                <div className="space-y-3">
                  <Label>Kategori Pengeluaran</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableExpenseCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category}
                          checked={expenseCategories.includes(category)}
                          onCheckedChange={(checked) =>
                            handleExpenseCategoryChange(
                              category,
                              checked as boolean,
                            )
                          }
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Status informasi */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Minat: {interests.length} dipilih</div>
                    <div>Penghasilan: {incomeRange || 'Belum dipilih'}</div>
                    <div>Kategori: {expenseCategories.length} dipilih</div>
                  </div>

                  <Button
                    className={`w-full shadow-md hover:shadow-lg transition-all duration-300 ${
                      interests.length === 0 ||
                      !incomeRange ||
                      expenseCategories.length === 0
                        ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    } text-white`}
                    onClick={handleCompleteProfile}
                    disabled={
                      completeProfileMutation.isPending ||
                      interests.length === 0 ||
                      !incomeRange ||
                      expenseCategories.length === 0
                    }
                  >
                    {completeProfileMutation.isPending
                      ? 'Menyimpan...'
                      : interests.length === 0 ||
                        !incomeRange ||
                        expenseCategories.length === 0
                      ? 'Lengkapi semua data terlebih dahulu'
                      : 'Simpan Profil'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span>Notifikasi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationEmail}
                    onCheckedChange={(v) => setNotificationEmail(!!v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={notificationPush}
                    onCheckedChange={(v) => setNotificationPush(!!v)}
                  />
                </div>

                <FeatureGate
                  feature="goal_reminders"
                  requiredPlan="premium"
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <Label>Goal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for savings goals
                    </p>
                  </div>
                  <Switch
                    checked={notificationGoalReminders}
                    onCheckedChange={(v) => setNotificationGoalReminders(!!v)}
                  />
                </FeatureGate>

                <FeatureGate
                  feature="budget_alerts"
                  requiredPlan="premium"
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts when approaching budget limits
                    </p>
                  </div>
                  <Switch
                    checked={notificationBudgetAlerts}
                    onCheckedChange={(v) => setNotificationBudgetAlerts(!!v)}
                  />
                </FeatureGate>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span>Keamanan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Separator />

                <FeatureGate
                  feature="two_factor_auth"
                  requiredPlan="premium"
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast({
                        title: 'Segera hadir',
                        description:
                          'Dukungan autentikasi dua faktor akan tersedia di rilis berikutnya.',
                      })
                    }
                  >
                    Enable
                  </Button>
                </FeatureGate>

                <Button
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending
                    ? 'Menyimpan...'
                    : 'Perbarui Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <Crown className="h-5 w-5" />
                    </div>
                    <span>Langganan</span>
                  </div>
                  {currentSubscription && (
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          currentSubscription.status,
                        )}`}
                      ></div>
                      <Badge
                        variant={
                          currentSubscription.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {getStatusText(currentSubscription.status)}
                      </Badge>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSubscription ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ) : currentSubscription ? (
                  <>
                    {/* Current Plan Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getPlanIcon(currentSubscription.plan.name)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getPlanDisplayName(
                                currentSubscription.plan.name,
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {currentSubscription.plan.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {format(currentSubscription.plan.price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            /
                            {currentSubscription.plan.interval === 'monthly'
                              ? 'bulan'
                              : 'tahun'}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Plan Features */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Fitur yang Tersedia:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            {currentSubscription.plan.hasAI ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>AI Assistant</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {currentSubscription.plan.hasOCR ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>OCR Upload</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {currentSubscription.plan.hasReports ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>Laporan Detail</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {currentSubscription.plan.hasExport ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>Export Data</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="pt-2 space-y-2">
                  {currentSubscription.status !== 'active' ? (
                    <Button
                      onClick={() => setShowSubscriptionPopup(true)}
                      className="w-full"
                      variant={
                        currentSubscription.status === 'expired' ||
                        currentSubscription.status === 'cancelled'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {currentSubscription.status === 'expired' ||
                      currentSubscription.status === 'cancelled'
                        ? 'Aktifkan Kembali'
                        : 'Upgrade Plan'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowSubscriptionPopup(true)}
                      className="w-full"
                      variant="outline"
                    >
                      Upgrade ke Paket Lain
                    </Button>
                  )}
                </div> */}
                  </>
                ) : (
                  /* No Subscription - Free Plan */
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <span className="text-4xl">🆓</span>
                      <h3 className="font-semibold text-lg">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Anda sedang menggunakan paket gratis dengan fitur
                        terbatas
                      </p>
                    </div>

                    <Separator />

                    {/* Free Plan Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Fitur Gratis:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Transaksi Dasar</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Goals Sederhana</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <X className="h-4 w-4 text-red-500" />
                          <span>AI Assistant</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <X className="h-4 w-4 text-red-500" />
                          <span>OCR Upload</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      onClick={() => setShowSubscriptionPopup(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Upgrade ke Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Plans */}
            {currentSubscription &&
              currentSubscription.status === 'active' &&
              availablePlans &&
              availablePlans.length > 1 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <Crown className="h-5 w-5" />
                      </div>
                      <span>Paket Lain yang Tersedia</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upgrade atau downgrade ke paket lain sesuai kebutuhan Anda
                    </p>
                    <div className="grid gap-3">
                      {availablePlans
                        .filter(
                          (plan) => plan.id !== currentSubscription.planId,
                        )
                        .map((plan) => (
                          <div
                            key={plan.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">
                                {getPlanIcon(plan.name)}
                              </span>
                              <div>
                                <h4 className="font-medium">
                                  {getPlanDisplayName(plan.name)}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {plan.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {format(plan.price)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                /
                                {plan.interval === 'monthly'
                                  ? 'bulan'
                                  : 'tahun'}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => setShowSubscriptionPopup(true)}
                              >
                                Pilih Paket
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Preferences */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span>Preferensi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Pilih tema aplikasi yang sesuai
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <FeatureGate
                  feature="ai_model_selection"
                  requiredPlan="premium"
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label>AI Model</Label>
                  </div>
                  <select
                    className="w-full p-2 border border-input bg-background rounded-md"
                    value={aiModel}
                    onChange={(e) =>
                      setAIModel(e.target.value as 'deepseek' | 'gemini')
                    }
                  >
                    <option value="deepseek">DeepSeek</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </FeatureGate>

                {/* 
              Currency selection removed - standardized to IDR
              To restore multi-currency support:
              1. Uncomment the code below
              2. Update CurrencyCode type in SettingsContext.tsx to include other currencies
              3. Update currency formatter in lib/currency.ts to handle multiple currencies
            */}
                {/* <div className="space-y-2">
              <Label>Currency</Label>
              <select
                className="w-full p-2 border border-input bg-background rounded-md"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div> */}

                {/* 
              Locale selection removed - standardized to Indonesian (id-ID)
              To restore multi-locale support, uncomment the code below
            */}
                {/* <div className="space-y-2">
              <Label>Locale</Label>
              <select
                className="w-full p-2 border border-input bg-background rounded-md"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                <option value="id-ID">Indonesia (id-ID)</option>
                <option value="en-US">English (en-US)</option>
                <option value="en-GB">English UK (en-GB)</option>
                <option value="ja-JP">日本語 (ja-JP)</option>
                <option value="de-DE">Deutsch (de-DE)</option>
              </select>
            </div> */}

                <FeatureGate
                  feature="timezone_selection"
                  requiredPlan="premium"
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label>Time Zone</Label>
                  </div>
                  <select
                    className="w-full p-2 border border-input bg-background rounded-md"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                  >
                    <option value="Asia/Jakarta">
                      Asia/Jakarta (WIB - Waktu Indonesia Barat)
                    </option>
                    <option value="Asia/Makassar">
                      Asia/Makassar (WITA - Waktu Indonesia Tengah)
                    </option>
                    <option value="Asia/Jayapura">
                      Asia/Jayapura (WIT - Waktu Indonesia Timur)
                    </option>
                  </select>
                </FeatureGate>

                {/* <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Data & Privacy */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <span>Data & Privasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FeatureGate
                  feature="data_export"
                  requiredPlan="premium"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="flex items-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 w-full"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </FeatureGate>
                <Button
                  variant="outline"
                  className="flex items-center hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                  onClick={() =>
                    toast({
                      title: 'Segera hadir',
                      description:
                        'Kebijakan privasi akan tersedia di rilis berikutnya.',
                    })
                  }
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Kebijakan Privasi
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center hover:bg-red-600 transition-all duration-300"
                  onClick={() =>
                    toast({
                      title: 'Segera hadir',
                      description:
                        'Hapus akun belum tersedia. Hubungi support untuk bantuan.',
                    })
                  }
                >
                  Hapus Akun
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Upgrade Prompt for Free Users */}
          {(!currentSubscription ||
            currentSubscription.plan.name.toLowerCase() === 'free') && (
            <Card className="mt-8 shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-4xl">👑</div>
                  <h3 className="font-semibold text-xl">Upgrade ke Premium</h3>
                  <p className="text-muted-foreground">
                    Akses semua fitur premium dan tingkatkan produktivitas Anda
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-blue-500" />
                    <span>AI Assistant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-blue-500" />
                    <span>OCR Upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-blue-500" />
                    <span>Export Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-blue-500" />
                    <span>Priority Support</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSubscriptionPopup(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade ke Premium - Rp 99.000/bulan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Subscription Popup */}
          <SubscriptionPopup
            isOpen={showSubscriptionPopup}
            onClose={() => setShowSubscriptionPopup(false)}
          />
        </div>
      </div>
    </div>
  );
}
