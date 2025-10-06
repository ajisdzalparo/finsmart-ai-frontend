import { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  PlusCircle,
  Target,
  BarChart3,
  Settings,
  Menu,
  Wallet,
  Bot,
  LogOut,
  User,
  Sun,
  Moon,
  Tag,
  TrendingUp,
  PieChart,
  CreditCard,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext'; // asumsi ada useAuth()
import { useTheme } from 'next-themes'; // untuk toggle theme

const navigation = [
  // Main Navigation
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    category: 'main',
    description: 'Overview finansial Anda',
  },

  // Financial Management
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
    category: 'financial',
    description: 'Kelola transaksi',
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Tag,
    category: 'financial',
    description: 'Kategori transaksi',
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
    category: 'financial',
    description: 'Target keuangan',
  },

  // Analytics & AI
  {
    name: 'Reports',
    href: '/reports',
    icon: PieChart,
    category: 'analytics',
    description: 'Laporan keuangan',
  },
  {
    name: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
    category: 'analytics',
    description: 'Asisten AI',
  },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const { setTheme, theme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Header */}
      <header className="bg-background shadow border-b border-border transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-primary hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 text-primary">
                <Wallet className="h-8 w-8" />
                <h1 className="text-xl font-bold">FinSmartAI</h1>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              {/* Dashboard - Always visible */}
              {navigation
                .filter((item) => item.category === 'main')
                .map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Button
                      key={item.name}
                      variant="ghost"
                      size="sm"
                      asChild
                      className={cn(
                        'text-primary/80 hover:text-primary hover:bg-accent transition-all duration-200',
                        active && 'text-primary bg-accent shadow-sm',
                      )}
                    >
                      <NavLink to={item.href}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </NavLink>
                    </Button>
                  );
                })}

              {/* Divider */}
              <div className="w-px h-6 bg-border mx-2" />

              {/* Financial Management Group */}
              <div className="flex items-center space-x-1">
                {navigation
                  .filter((item) => item.category === 'financial')
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          'text-primary/80 hover:text-primary hover:bg-accent transition-all duration-200',
                          active && 'text-primary bg-accent shadow-sm',
                        )}
                      >
                        <NavLink to={item.href}>
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </NavLink>
                      </Button>
                    );
                  })}
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-border mx-2" />

              {/* Analytics & AI Group */}
              <div className="flex items-center space-x-1">
                {navigation
                  .filter((item) => item.category === 'analytics')
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          'text-primary/80 hover:text-primary hover:bg-accent transition-all duration-200',
                          active && 'text-primary bg-accent shadow-sm',
                        )}
                      >
                        <NavLink to={item.href}>
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </NavLink>
                      </Button>
                    );
                  })}
              </div>
            </nav>

            {/* Profile dropdown + Dark mode toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-accent"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-4 focus:outline-none">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-primary font-medium text-sm">
                          {user?.email || 'Guest'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Personal Account
                        </p>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.email || 'Guest'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Personal Account
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <NavLink to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-background/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-elevated transition-colors">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-8">
                <Wallet className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">FinSmartAI</h2>
              </div>
              <nav className="space-y-6">
                {/* Dashboard Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Main
                  </h3>
                  {navigation
                    .filter((item) => item.category === 'main')
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Button
                          key={item.name}
                          variant="ghost"
                          asChild
                          className={cn(
                            'w-full justify-start hover:bg-muted transition-all duration-200',
                            active && 'bg-muted text-foreground shadow-sm',
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <NavLink to={item.href}>
                            <Icon className="h-4 w-4 mr-3" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </NavLink>
                        </Button>
                      );
                    })}
                </div>

                {/* Financial Management Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Financial Management
                  </h3>
                  {navigation
                    .filter((item) => item.category === 'financial')
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Button
                          key={item.name}
                          variant="ghost"
                          asChild
                          className={cn(
                            'w-full justify-start hover:bg-muted transition-all duration-200',
                            active && 'bg-muted text-foreground shadow-sm',
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <NavLink to={item.href}>
                            <Icon className="h-4 w-4 mr-3" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </NavLink>
                        </Button>
                      );
                    })}
                </div>

                {/* Analytics & AI Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Analytics & AI
                  </h3>
                  {navigation
                    .filter((item) => item.category === 'analytics')
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Button
                          key={item.name}
                          variant="ghost"
                          asChild
                          className={cn(
                            'w-full justify-start hover:bg-muted transition-all duration-200',
                            active && 'bg-muted text-foreground shadow-sm',
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <NavLink to={item.href}>
                            <Icon className="h-4 w-4 mr-3" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </NavLink>
                        </Button>
                      );
                    })}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
