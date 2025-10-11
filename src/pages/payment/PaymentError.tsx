import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

export default function PaymentError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorData, setErrorData] = useState<any>(null);

  useEffect(() => {
    // Get error data from URL params
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    
    if (paymentId && status === 'failed') {
      setErrorData({
        paymentId,
        status,
        error: error || 'Pembayaran gagal diproses',
        plan: searchParams.get('plan'),
        amount: searchParams.get('amount'),
      });
    }
  }, [searchParams]);

  const getErrorMessage = (error: string) => {
    switch (error.toLowerCase()) {
      case 'insufficient_funds':
        return 'Saldo tidak mencukupi. Silakan coba dengan metode pembayaran lain.';
      case 'card_declined':
        return 'Kartu ditolak. Periksa kembali informasi kartu Anda.';
      case 'expired_card':
        return 'Kartu telah kedaluwarsa. Gunakan kartu yang masih berlaku.';
      case 'invalid_cvv':
        return 'CVV tidak valid. Periksa kembali kode keamanan kartu.';
      case 'network_error':
        return 'Terjadi kesalahan jaringan. Silakan coba lagi.';
      default:
        return 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center shadow-xl">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <XCircle className="h-16 w-16 text-red-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Pembayaran Gagal
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-gray-600 dark:text-gray-300">
                Maaf, pembayaran Anda tidak dapat diproses.
              </p>
              {errorData && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {getErrorMessage(errorData.error)}
                  </div>
                  {errorData.paymentId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID Pembayaran: {errorData.paymentId}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Jangan khawatir, Anda dapat mencoba lagi dengan metode pembayaran yang berbeda.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={() => navigate('/settings')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

