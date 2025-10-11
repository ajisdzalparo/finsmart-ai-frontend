import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PWAUpdatePrompt } from '@/components/ui/pwa-update-prompt';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Goals from './pages/Goals';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { AuthProvider } from '../src/context/AuthContext';
import { withAuth } from './hoc/withAuth';
import { ThemeProvider } from 'next-themes';
import { queryClient } from './api/queryClient';
import { SettingsProvider } from './context/SettingsContext';
import { ProfileCompletionWrapper } from './components/ProfileCompletionWrapper';

const ProtectedDashboard = withAuth(Dashboard);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <Sonner />
        <SettingsProvider>
          <AuthProvider>
            <ProfileCompletionWrapper>
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<AppLayout />}>
                    <Route path="dashboard" element={<ProtectedDashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ProfileCompletionWrapper>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
      <PWAUpdatePrompt
        onUpdate={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
              if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            });
          }
        }}
        onDismiss={() => {
          // Dismiss update prompt
        }}
      />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
