import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Calendar, AlertCircle } from 'lucide-react';
import {
  usePaginatedTransactionsQuery,
  useCreateTransactionMutation,
  Transaction,
  validateTransactionName,
  PaginatedTransactionsResponse,
} from '@/api/transactions';
import { useCategoriesQuery } from '@/api/categories';
import { useGoalsQuery } from '@/api/goals';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCurrencyFormatter } from '@/lib/currency';

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: categories } = useCategoriesQuery();
  const { data: goals } = useGoalsQuery();
  const createTransactionMutation = useCreateTransactionMutation();
  const { toast } = useToast();
  const { format } = useCurrencyFormatter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'income' | 'expense' | 'transfer'
  >('all');

  const paginatedQuery = usePaginatedTransactionsQuery(page, limit, {
    type: filterType,
    q: searchTerm,
  });
  const paginated = paginatedQuery.data as
    | PaginatedTransactionsResponse
    | undefined;
  const isLoading = paginatedQuery.isLoading;
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    currency: 'IDR',
  });
  const [goalAllocations, setGoalAllocations] = useState<
    Array<{ goalId: string; amount: string }>
  >([]);
  const [validationError, setValidationError] = useState<string>('');

  const handleCreateTransaction = async () => {
    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.categoryId
    ) {
      toast({
        title: 'Error',
        description: 'Mohon lengkapi semua field yang diperlukan',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        categoryId: newTransaction.categoryId,
        transactionDate: newTransaction.transactionDate,
        currency: newTransaction.currency,
        goalAllocations: goalAllocations
          .filter((g) => g.goalId && g.amount && Number(g.amount) > 0)
          .map((g) => ({ goalId: g.goalId, amount: Number(g.amount) })),
      });

      toast({
        title: 'Berhasil',
        description: 'Transaksi berhasil ditambahkan',
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      // Handle validation error untuk nama transaksi unik
      const errorResponse = error as {
        response?: { data?: { error?: string; details?: string } };
      };
      if (
        errorResponse?.response?.data?.error ===
        'Nama transaksi sudah ada untuk kategori ini'
      ) {
        toast({
          title: 'Error',
          description:
            errorResponse.response.data.details ||
            'Nama transaksi sudah ada untuk kategori ini',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Gagal menambahkan transaksi',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setNewTransaction({
      description: '',
      amount: '',
      categoryId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      currency: 'IDR',
    });
    setValidationError('');
    setGoalAllocations([]);
  };

  // Fungsi untuk validasi real-time menggunakan API dengan debounce
  const checkTransactionName = useCallback(
    async (description: string, categoryId: string) => {
      if (!description || !categoryId) {
        setValidationError('');
        return;
      }

      try {
        const validationResult = await validateTransactionName(
          description,
          categoryId,
        );

        if (!validationResult.isValid) {
          setValidationError(validationResult.message);
        } else {
          setValidationError('');
        }
      } catch (error) {
        setValidationError('');
      }
    },
    [],
  );

  // Debounce effect untuk validasi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newTransaction.description && newTransaction.categoryId) {
        checkTransactionName(
          newTransaction.description,
          newTransaction.categoryId,
        );
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [
    newTransaction.description,
    newTransaction.categoryId,
    checkTransactionName,
  ]);

  // Reset halaman saat filter atau pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterType]);

  // Pastikan nomor halaman selalu dalam rentang valid saat total halaman berubah
  useEffect(() => {
    const totalPages = paginated?.pagination.totalPages || 1;
    if (page > totalPages) {
      setPage(totalPages);
    } else if (page < 1) {
      setPage(1);
    }
  }, [paginated?.pagination.totalPages, page]);

  const items = paginated?.items || [];
  const filteredTransactions = items; // Disaring di server melalui query params

  const formatCurrency = (amount: number) => format(amount);

  const getCategoryInfo = (categoryId: string) => {
    return categories?.find((cat) => cat.id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pemasukan dan pengeluaran Anda
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pemasukan dan pengeluaran Anda
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={resetForm}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Baru</DialogTitle>
              <DialogDescription>
                Tambahkan transaksi pemasukan atau pengeluaran baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  placeholder="Masukkan deskripsi transaksi"
                  value={newTransaction.description}
                  onChange={(e) => {
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    });
                  }}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      {validationError}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="flex-1 min-w-0"
                  />
                  {newTransaction.amount && (
                    <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {format(Math.abs(Number(newTransaction.amount) || 0))}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={newTransaction.categoryId}
                  onValueChange={(value) => {
                    setNewTransaction({ ...newTransaction, categoryId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.type === 'income'
                              ? 'Pemasukan'
                              : category.type === 'expense'
                              ? 'Pengeluaran'
                              : 'Transfer'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <DatePicker
                  id="date"
                  value={newTransaction.transactionDate}
                  onChange={(val) =>
                    setNewTransaction({
                      ...newTransaction,
                      transactionDate: val,
                    })
                  }
                />
              </div>

              {/* Goal Allocations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Alokasi ke Goals (opsional)</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setGoalAllocations((prev) => [
                        ...prev,
                        { goalId: '', amount: '' },
                      ])
                    }
                  >
                    Tambah Alokasi
                  </Button>
                </div>
                <div className="space-y-2">
                  {goalAllocations.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Anda dapat membagi jumlah transaksi ke satu atau beberapa
                      goals.
                    </p>
                  )}
                  {goalAllocations.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3">
                      <Select
                        value={row.goalId}
                        onValueChange={(val) =>
                          setGoalAllocations((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], goalId: val };
                            return next;
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {goals?.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex flex-col items-start gap-3">
                        <Input
                          type="number"
                          placeholder="Jumlah"
                          value={row.amount}
                          onChange={(e) =>
                            setGoalAllocations((prev) => {
                              const next = [...prev];
                              next[idx] = {
                                ...next[idx],
                                amount: e.target.value,
                              };
                              return next;
                            })
                          }
                          className="flex-1 min-w-0"
                        />
                        {row.amount && (
                          <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                            {format(Math.abs(Number(row.amount) || 0))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateTransaction}
                disabled={
                  createTransactionMutation.isPending || !!validationError
                }
              >
                {createTransactionMutation.isPending
                  ? 'Menyimpan...'
                  : 'Tambah Transaksi'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) =>
            setFilterType(v as 'all' | 'income' | 'expense' | 'transfer')
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada transaksi ditemukan</p>
                <p className="text-sm">
                  Mulai dengan menambahkan transaksi pertama Anda
                </p>
              </div>
            ) : (
              (() => {
                const groups = filteredTransactions.reduce(
                  (acc: Record<string, Transaction[]>, t) => {
                    const key = new Date(t.transactionDate).toLocaleDateString(
                      'id-ID',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    );
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(t);
                    return acc;
                  },
                  {},
                );
                const sections = Object.entries(groups).sort(
                  (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
                );

                return sections.map(([dateLabel, items], sectionIdx) => (
                  <div key={dateLabel} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {dateLabel}
                      </h3>
                      <Separator className="flex-1" />
                      <Badge variant="outline" className="text-xs">
                        {items.length} transaksi
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((transaction, index) => {
                        const categoryInfo = getCategoryInfo(
                          transaction.categoryId || '',
                        );
                        const isIncome = categoryInfo?.type === 'income';
                        return (
                          <motion.div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                                style={{
                                  backgroundColor:
                                    categoryInfo?.color || '#6b7280',
                                }}
                              >
                                {categoryInfo?.icon || '💰'}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {transaction.description || 'Tanpa deskripsi'}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  {categoryInfo && (
                                    <Badge variant="secondary">
                                      {categoryInfo.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <p
                                  className={`font-semibold text-lg ${
                                    isIncome
                                      ? 'text-success'
                                      : 'text-destructive dark:text-destructive-foreground'
                                  }`}
                                >
                                  {isIncome ? '+' : '-'}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {sectionIdx !== sections.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ));
              })()
            )}
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const total = paginated?.pagination.total ?? 0;
                  const currentPage = paginated?.pagination.page ?? page;
                  const pageLimit = paginated?.pagination.limit ?? limit;
                  const totalPages = paginated?.pagination.totalPages ?? 1;
                  const from =
                    total === 0 ? 0 : (currentPage - 1) * pageLimit + 1;
                  const to =
                    total === 0 ? 0 : Math.min(currentPage * pageLimit, total);
                  return `Menampilkan ${from}–${to} dari ${total} (Hal ${currentPage} / ${totalPages})`;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    const next = Number(val);
                    setLimit(next);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Baris / halaman" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((opt) => (
                      <SelectItem key={opt} value={String(opt)}>
                        {opt} / halaman
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    « Pertama
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ‹ Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(paginated?.pagination.totalPages || 1, p + 1),
                      )
                    }
                    disabled={page >= (paginated?.pagination.totalPages || 1)}
                  >
                    Selanjutnya ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage(paginated?.pagination.totalPages || 1)
                    }
                    disabled={page >= (paginated?.pagination.totalPages || 1)}
                  >
                    Terakhir »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
