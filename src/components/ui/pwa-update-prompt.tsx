import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Download } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function PWAUpdatePrompt({ onUpdate, onDismiss }: PWAUpdatePromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for PWA update events
    const handleUpdateAvailable = () => {
      setIsVisible(true);
    };

    // Check if there's an update available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          handleUpdateAvailable();
        }
      });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleUpdateAvailable,
        );
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Update Tersedia
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Versi baru aplikasi tersedia. Update untuk mendapatkan fitur
            terbaru.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onUpdate();
              }}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
            >
              Nanti
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

