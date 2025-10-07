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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/context/SettingsContext';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCategoriesQuery } from '@/api/categories';
import {
  useCompleteProfileMutation,
  useUpdateNameMutation,
  useChangePasswordMutation,
} from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

// Standardized to IDR only, but keeping other options commented for future use
type CurrencyCode = 'IDR';
// type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategoriesQuery();
  const completeProfileMutation = useCompleteProfileMutation();
  const updateNameMutation = useUpdateNameMutation();
  const changePasswordMutation = useChangePasswordMutation();
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
  if (
    expenseCategories.length === 0 &&
    availableExpenseCategories.length > 0 &&
    (user?.expenseCategories === undefined ||
      (user?.expenseCategories || []).length === 0)
  ) {
    // set secara sinkron saat render pertama kali ketika data sudah ada
    // (komponen akan re-render setelah state di-set)
    setExpenseCategories(availableExpenseCategories);
  }

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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui profil. Silakan coba lagi.',
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and app settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
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
              className="w-full"
              onClick={handleUpdateName}
              disabled={updateNameMutation.isPending}
            >
              {updateNameMutation.isPending ? 'Menyimpan...' : 'Update Name'}
            </Button>
          </CardContent>
        </Card>

        {/* Financial Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Financial Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interests */}
            <div className="space-y-3">
              <Label>Minat Investasi</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableInterests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
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
                  <div key={category} className="flex items-center space-x-2">
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

            <Button
              className="w-full"
              onClick={handleCompleteProfile}
              disabled={completeProfileMutation.isPending}
            >
              {completeProfileMutation.isPending
                ? 'Menyimpan...'
                : 'Simpan Profil'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
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

            <div className="flex items-center justify-between">
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
            </div>

            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
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

            <div className="flex items-center justify-between">
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
            </div>

            <Button
              className="w-full"
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? 'Menyimpan...'
                : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
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
            </div>

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

            <div className="space-y-2">
              <Label>Time Zone</Label>
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
                {/* 
                  Other timezone options commented for future use:
                  <option value="UTC">UTC</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                */}
              </select>
            </div>

            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data & Privacy */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() =>
                toast({
                  title: 'Segera hadir',
                  description:
                    'Kebijakan privasi akan tersedia di rilis berikutnya.',
                })
              }
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button
              variant="destructive"
              className="flex items-center"
              onClick={() =>
                toast({
                  title: 'Segera hadir',
                  description:
                    'Hapus akun belum tersedia. Hubungi support untuk bantuan.',
                })
              }
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
