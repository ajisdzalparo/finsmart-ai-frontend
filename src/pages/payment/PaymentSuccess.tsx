import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    
    if (paymentId && status === 'success') {
      setPaymentData({
        paymentId,
        status,
        amount: searchParams.get('amount'),
        plan: searchParams.get('plan'),
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Pembayaran Berhasil!
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
                Terima kasih! Pembayaran Anda telah berhasil diproses.
              </p>
              {paymentData && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ID Pembayaran: {paymentData.paymentId}
                  </div>
                  {paymentData.plan && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Paket: {paymentData.plan}
                    </div>
                  )}
                  {paymentData.amount && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Jumlah: Rp {parseInt(paymentData.amount).toLocaleString('id-ID')}
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
                Anda sekarang dapat mengakses semua fitur premium. 
                Email konfirmasi telah dikirim ke alamat email Anda.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/settings')}
                className="w-full"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Lihat Langganan
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

