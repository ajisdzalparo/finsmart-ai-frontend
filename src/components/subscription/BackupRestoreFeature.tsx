import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Check, Lock, Database } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PremiumFeatureCard from './PremiumFeatureCard';

interface BackupRestoreFeatureProps {
  className?: string;
}

export default function BackupRestoreFeature({
  className = '',
}: BackupRestoreFeatureProps) {
  const { hasAccess } = useFeatureAccess();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const hasBackupRestore = hasAccess('backup_restore', 'premium');

  const handleBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackingUp(false);
      // In real implementation, this would trigger download
      const dataStr = JSON.stringify({ message: 'Backup data' });
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finsmart-backup-${
        new Date().toISOString().split('T')[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsRestoring(true);
        // Simulate restore process
        setTimeout(() => {
          setIsRestoring(false);
          alert('Data berhasil di-restore!');
        }, 2000);
      }
    };
    input.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Backup & Restore Data
        </h2>
        <p className="text-gray-600">
          Backup dan restore data keuangan Anda dengan mudah
        </p>
      </div>

      <PremiumFeatureCard
        feature="backup_restore"
        title="Backup & Restore"
        description="Backup dan restore data keuangan"
        requiredPlan="premium"
        icon={<Database className="h-5 w-5" />}
        benefits={[
          'Backup data otomatis',
          'Restore data dari file',
          'Format JSON yang mudah dibaca',
          'Proteksi data keuangan',
        ]}
        className="max-w-4xl mx-auto"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {hasBackupRestore ? (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Aktif
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100">
                <Lock className="h-3 w-3 mr-1" />
                Terkunci
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Backup Data</h4>
              <p className="text-xs text-gray-600">
                Download semua data keuangan dalam format JSON
              </p>
              <Button
                className="w-full"
                disabled={!hasBackupRestore || isBackingUp}
                onClick={handleBackup}
                variant={hasBackupRestore ? 'default' : 'secondary'}
              >
                {isBackingUp ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Membuat Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Restore Data</h4>
              <p className="text-xs text-gray-600">
                Upload file backup untuk restore data
              </p>
              <Button
                className="w-full"
                disabled={!hasBackupRestore || isRestoring}
                onClick={handleRestore}
                variant={hasBackupRestore ? 'outline' : 'secondary'}
              >
                {isRestoring ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Restore
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-medium text-sm mb-2">
              Data yang akan di-backup:
            </h5>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Semua transaksi keuangan</li>
              <li>• Kategori dan sub-kategori</li>
              <li>• Goals dan target keuangan</li>
              <li>• Pengaturan aplikasi</li>
              <li>• Laporan dan analisis</li>
            </ul>
          </div>
        </div>
      </PremiumFeatureCard>
    </div>
  );
}
