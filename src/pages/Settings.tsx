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
import {
  useCompleteProfileMutation,
  useUpdateNameMutation,
  useChangePasswordMutation,
} from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const completeProfileMutation = useCompleteProfileMutation();
  const updateNameMutation = useUpdateNameMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const { currency, setCurrency, locale, setLocale, aiModel, setAIModel } =
    useSettings();

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

  const availableExpenseCategories = [
    'Makanan',
    'Transportasi',
    'Belanja',
    'Hiburan',
    'Kesehatan',
    'Pendidikan',
    'Tagihan',
    'Fashion',
    'Travel',
    'Lainnya',
  ];

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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Gagal mengganti password',
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notifications on your device
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for savings goals
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when approaching budget limits
                </p>
              </div>
              <Switch defaultChecked />
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
              <Button variant="outline" size="sm">
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

            <div className="space-y-2">
              <Label>Currency</Label>
              <select
                className="w-full p-2 border border-input bg-background rounded-md"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <select className="w-full p-2 border border-input bg-background rounded-md">
                <option value="pst">Pacific Standard Time</option>
                <option value="est">Eastern Standard Time</option>
                <option value="utc">UTC</option>
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
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button variant="destructive" className="flex items-center">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
