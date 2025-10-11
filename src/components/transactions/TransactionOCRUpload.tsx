import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Upload,
  FileText,
  Image,
  Camera,
  Eye,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyFormatter } from '@/lib/currency';
import { useCategoriesQuery } from '@/api/categories';
import { useCreateTransactionMutation } from '@/api/transactions';
import api from '@/api/api';
import OCRScanButton from './OCRScanButton';

interface ExtractedTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  confidence: number;
  rawText: string;
}

interface OCRResponse {
  success: boolean;
  data: {
    transactions: ExtractedTransaction[];
    receiptTotal?: number;
    receiptDate?: string;
  };
  message?: string;
}

interface TransactionOCRUploadProps {
  onTransactionCreated?: () => void;
}

export default function TransactionOCRUpload({
  onTransactionCreated,
}: TransactionOCRUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState<
    ExtractedTransaction[]
  >([]);
  const [editingTransaction, setEditingTransaction] =
    useState<ExtractedTransaction | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receiptTotal, setReceiptTotal] = useState<number | null>(null);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualTransaction, setManualTransaction] = useState<
    Partial<ExtractedTransaction>
  >({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    confidence: 1.0,
    rawText: 'Manual entry',
  });

  const { toast } = useToast();
  const { format } = useCurrencyFormatter();
  const { data: categories } = useCategoriesQuery();
  const createTransactionMutation = useCreateTransactionMutation();

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      setSelectedFile(file);
      setIsProcessing(true);

      try {
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        // Call OCR API
        const response = await api.post('/ocr/ocr-extract', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // API interceptor returns res.data directly, so response is already the data
        const responseData = response as unknown as OCRResponse;
        if (responseData.success) {
          setExtractedTransactions(responseData.data.transactions);
          setReceiptTotal(responseData.data.receiptTotal || null);
          toast({
            title: 'Berhasil',
            description: `Ditemukan ${responseData.data.transactions.length} transaksi`,
          });
        } else {
          throw new Error(
            responseData.message || 'Gagal mengekstrak transaksi',
          );
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengekstrak transaksi dari file',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast],
  );

  const handleRescan = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setExtractedTransactions([]); // Clear previous results

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call OCR API
      const response = await api.post('/transactions/ocr-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // API interceptor returns res.data directly, so response is already the data
      const responseData = response as unknown as OCRResponse;
      if (responseData.success) {
        setExtractedTransactions(responseData.data.transactions);
        setReceiptTotal(responseData.data.receiptTotal || null);
        toast({
          title: 'Rescan Berhasil',
          description: `Ditemukan ${responseData.data.transactions.length} transaksi`,
        });
      } else {
        throw new Error(responseData.message || 'Gagal mengekstrak transaksi');
      }
    } catch (error) {
      console.error('Rescan Error:', error);
      toast({
        title: 'Error',
        description: 'Gagal melakukan rescan transaksi',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleEditTransaction = (transaction: ExtractedTransaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveTransaction = async (transaction: ExtractedTransaction) => {
    try {
      console.log('Creating transaction with data:', {
        amount: transaction.amount,
        currency: 'IDR',
        description: transaction.description,
        transactionDate: transaction.date,
        categoryId: transaction.category || undefined,
      });

      await createTransactionMutation.mutateAsync({
        amount: transaction.amount,
        currency: 'IDR', // Default currency
        description: transaction.description,
        transactionDate: transaction.date,
        categoryId: transaction.category || undefined,
      });

      // Remove from extracted transactions
      setExtractedTransactions((prev) =>
        prev.filter((t) => t.id !== transaction.id),
      );

      toast({
        title: 'Berhasil',
        description: 'Transaksi berhasil dibuat',
      });

      onTransactionCreated?.();
    } catch (error) {
      console.error('Error creating transaction:', error);

      // Get more detailed error message
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal membuat transaksi';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleRejectTransaction = (transactionId: string) => {
    setExtractedTransactions((prev) =>
      prev.filter((t) => t.id !== transactionId),
    );
  };

  // Calculate total amount of extracted transactions
  const totalAmount = extractedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedTransactions([]);
    setEditingTransaction(null);
    setReceiptTotal(null);
    setShowAddManual(false);
    setManualTransaction({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
      confidence: 1.0,
      rawText: 'Manual entry',
    });
  };

  const handleAddManualTransaction = () => {
    if (
      !manualTransaction.description ||
      !manualTransaction.amount ||
      manualTransaction.amount <= 0
    ) {
      toast({
        title: 'Error',
        description: 'Mohon isi deskripsi dan jumlah yang valid',
        variant: 'destructive',
      });
      return;
    }

    const newTransaction: ExtractedTransaction = {
      id: `manual-${Date.now()}`,
      description: manualTransaction.description,
      amount: manualTransaction.amount,
      date: manualTransaction.date || new Date().toISOString().split('T')[0],
      category: manualTransaction.category,
      confidence: 1.0,
      rawText: 'Manual entry',
    };

    setExtractedTransactions((prev) => [...prev, newTransaction]);
    setShowAddManual(false);
    setManualTransaction({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
      confidence: 1.0,
      rawText: 'Manual entry',
    });

    toast({
      title: 'Berhasil',
      description: 'Transaksi manual ditambahkan',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Tinggi';
    if (confidence >= 0.6) return 'Sedang';
    return 'Rendah';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <OCRScanButton />
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Scan Nota & Ekstrak Transaksi
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Upload foto nota, file gambar, atau file teks untuk mengekstrak
            transaksi secara otomatis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!selectedFile && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 dark:border-gray-600 rounded-lg p-8 text-center hover:border-muted-foreground/50 dark:hover:border-gray-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted/50 rounded-full">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white">
                        Upload File Nota
                      </h3>
                      <p className="text-muted-foreground dark:text-gray-300">
                        Drag & drop file atau klik untuk memilih
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>JPG, PNG</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>TXT</span>
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* File Preview */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  File Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {isProcessing && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Memproses...</span>
                      </div>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-contain bg-muted/20"
                      />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUpload}
                    className="w-full"
                  >
                    Upload File Lain
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Transactions */}
          {extractedTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Transaksi yang Ditemukan ({extractedTransactions.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRescan}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {isProcessing ? 'Rescanning...' : 'Rescan'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddManual(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Manual
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {transaction.description}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={`text-white ${getConfidenceColor(
                                transaction.confidence,
                              )}`}
                            >
                              {getConfidenceText(transaction.confidence)}
                            </Badge>
                            {transaction.rawText === 'Manual entry' && (
                              <Badge variant="outline" className="text-xs">
                                Manual
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Jumlah:
                              </span>
                              <span className="ml-2 font-medium">
                                {format(transaction.amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Tanggal:
                              </span>
                              <span className="ml-2 font-medium">
                                {new Date(transaction.date).toLocaleDateString(
                                  'id-ID',
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSaveTransaction(transaction)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleRejectTransaction(transaction.id)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Raw Text Preview */}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Lihat teks asli
                        </summary>
                        <div className="mt-2 p-2 bg-muted/30 rounded text-muted-foreground font-mono">
                          {transaction.rawText}
                        </div>
                      </details>
                    </motion.div>
                  ))}
                </div>

                {/* Total Calculation */}
                {extractedTransactions.length > 1 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Total {extractedTransactions.length} item:
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {format(totalAmount)}
                        </div>
                      </div>

                      {receiptTotal && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Total di nota asli:
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              totalAmount === receiptTotal
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {format(receiptTotal)}
                          </div>
                        </div>
                      )}

                      {receiptTotal && totalAmount !== receiptTotal && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Selisih:
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              totalAmount > receiptTotal
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {totalAmount > receiptTotal ? '+' : ''}
                            {format(totalAmount - receiptTotal)}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {receiptTotal && totalAmount === receiptTotal
                          ? '✅ Total sesuai dengan nota asli'
                          : receiptTotal
                          ? '⚠️ Total tidak sesuai, periksa kembali'
                          : 'Verifikasi total ini dengan jumlah di nota asli'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit Transaction Dialog */}
          {editingTransaction && (
            <TransactionEditDialog
              transaction={editingTransaction}
              categories={categories || []}
              onSave={(updatedTransaction) => {
                handleSaveTransaction(updatedTransaction);
                setEditingTransaction(null);
              }}
              onCancel={() => setEditingTransaction(null)}
            />
          )}

          {/* Add Manual Transaction Dialog */}
          <Dialog open={showAddManual} onOpenChange={setShowAddManual}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Transaksi Manual</DialogTitle>
                <DialogDescription>
                  Tambahkan transaksi yang tidak terdeteksi oleh scan
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-description">Deskripsi</Label>
                  <Input
                    id="manual-description"
                    value={manualTransaction.description || ''}
                    onChange={(e) =>
                      setManualTransaction({
                        ...manualTransaction,
                        description: e.target.value,
                      })
                    }
                    placeholder="Masukkan deskripsi transaksi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-amount">Jumlah</Label>
                  <Input
                    id="manual-amount"
                    type="number"
                    value={manualTransaction.amount || ''}
                    onChange={(e) =>
                      setManualTransaction({
                        ...manualTransaction,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-category">Kategori</Label>
                  <Select
                    value={manualTransaction.category || ''}
                    onValueChange={(value) =>
                      setManualTransaction({
                        ...manualTransaction,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-date">Tanggal</Label>
                  <DatePicker
                    value={manualTransaction.date || ''}
                    onChange={(date: string) =>
                      setManualTransaction({
                        ...manualTransaction,
                        date: date,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddManual(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleAddManualTransaction}>Tambahkan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Transaction Edit Dialog Component
interface TransactionEditDialogProps {
  transaction: ExtractedTransaction;
  categories: Array<{
    id: string;
    name: string;
    type: string;
    color?: string;
    icon?: string;
  }>;
  onSave: (transaction: ExtractedTransaction) => void;
  onCancel: () => void;
}

function TransactionEditDialog({
  transaction,
  categories,
  onSave,
  onCancel,
}: TransactionEditDialogProps) {
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  const handleSave = () => {
    onSave(editedTransaction);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>
            Periksa dan edit detail transaksi sebelum menyimpan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              value={editedTransaction.description}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              value={editedTransaction.amount}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  amount: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={editedTransaction.category || ''}
              onValueChange={(value) =>
                setEditedTransaction({
                  ...editedTransaction,
                  category: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <DatePicker
              value={editedTransaction.date}
              onChange={(date: string) =>
                setEditedTransaction({
                  ...editedTransaction,
                  date: date,
                })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
