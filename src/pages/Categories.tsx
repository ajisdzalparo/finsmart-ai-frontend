/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  RotateCcw,
  Archive,
} from 'lucide-react';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useDeletedCategoriesQuery,
  useRestoreCategoryMutation,
  Category,
  CreateCategoryData,
} from '@/api/categories';
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

const categoryTypes = [
  {
    value: 'income',
    label: 'Pemasukan',
    icon: TrendingUp,
    color: 'text-success',
  },
  {
    value: 'expense',
    label: 'Pengeluaran',
    icon: TrendingDown,
    color: 'text-destructive',
  },
  {
    value: 'transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
    color: 'text-primary',
  },
];

const categoryColors = [
  { value: '#ef4444', label: 'Merah' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Kuning' },
  { value: '#22c55e', label: 'Hijau' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Biru' },
  { value: '#8b5cf6', label: 'Ungu' },
  { value: '#ec4899', label: 'Pink' },
];

const categoryIcons = [
  '🍔',
  '🚗',
  '🏠',
  '👕',
  '🎬',
  '🏥',
  '📚',
  '✈️',
  '💊',
  '🎮',
  '💰',
  '💳',
  '📱',
  '💻',
  '☕',
  '🍕',
  '🛒',
  '⛽',
  '🎵',
  '🎯',
];

export default function Categories() {
  const { data: categories, isLoading } = useCategoriesQuery();
  const { data: deletedCategories, isLoading: isLoadingDeleted } =
    useDeletedCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const restoreCategoryMutation = useRestoreCategoryMutation();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    type: 'expense',
    color: '#ef4444',
    icon: '🍔',
  });

  const handleCreateCategory = async () => {
    // Check for duplicate category name and type
    const duplicateCategory = categories?.find(
      (cat) =>
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        cat.type === formData.type,
    );

    if (duplicateCategory) {
      toast({
        title: 'Error',
        description: `Kategori "${formData.name}" dengan tipe "${formData.type}" sudah ada`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCategoryMutation.mutateAsync(formData);
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil dibuat',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Gagal membuat kategori',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    // Check for duplicate category name and type (excluding current category)
    const duplicateCategory = categories?.find(
      (cat) =>
        cat.id !== editingCategory.id &&
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        cat.type === formData.type,
    );

    if (duplicateCategory) {
      toast({
        title: 'Error',
        description: `Kategori "${formData.name}" dengan tipe "${formData.type}" sudah ada`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: formData,
      });
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil diperbarui',
      });
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      const errorMessage = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        title: 'Error',
        description:
          errorMessage.response?.data?.message || 'Gagal memperbarui kategori',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil dihapus',
      });
    } catch (error: any) {
      const errorMessage = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        title: 'Error',
        description:
          errorMessage.response?.data?.message || 'Gagal menghapus kategori',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreCategory = async (id: string) => {
    try {
      await restoreCategoryMutation.mutateAsync(id);
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil dipulihkan',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Gagal memulihkan kategori',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#ef4444',
      icon: '🍔',
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#ef4444',
      icon: category.icon || '🍔',
    });
  };

  const groupedCategories =
    categories?.reduce((acc, category) => {
      if (!acc[category.type]) {
        acc[category.type] = [];
      }
      acc[category.type].push(category);
      return acc;
    }, {} as Record<string, Category[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kategori</h1>
          <p className="text-muted-foreground mt-2">
            Kelola kategori pemasukan dan pengeluaran Anda
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kategori</h1>
          <p className="text-muted-foreground mt-2">
            Kelola kategori pemasukan dan pengeluaran Anda
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant={showDeleted ? 'outline' : 'default'}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Kategori Aktif
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Kategori Terhapus
              </>
            )}
          </Button>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                <DialogDescription>
                  Buat kategori baru untuk mengorganisir transaksi Anda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kategori</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Makanan, Transportasi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Jenis</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Warna</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color.value
                            ? 'border-foreground'
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-10 gap-2">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon}
                        className={`w-8 h-8 text-lg rounded border-2 ${
                          formData.icon === icon
                            ? 'border-foreground'
                            : 'border-border'
                        }`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
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
                  onClick={handleCreateCategory}
                  disabled={!formData.name}
                >
                  Buat Kategori
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories by Type */}
      {showDeleted ? (
        // Show deleted categories
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Kategori Terhapus</h2>
            <Badge variant="secondary">{deletedCategories?.length || 0}</Badge>
          </div>

          {isLoadingDeleted ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : deletedCategories && deletedCategories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deletedCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow opacity-75"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Dihapus{' '}
                            {new Date(category.deletedAt!).toLocaleDateString(
                              'id-ID',
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreCategory(category.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tidak ada kategori yang dihapus
              </p>
            </div>
          )}
        </div>
      ) : (
        // Show active categories
        categoryTypes.map((type) => {
          const typeCategories = groupedCategories[type.value] || [];
          const TypeIcon = type.icon;

          return (
            <div key={type.value} className="space-y-4">
              <div className="flex items-center space-x-2">
                <TypeIcon className={`h-5 w-5 ${type.color}`} />
                <h2 className="text-xl font-semibold">{type.label}</h2>
                <Badge variant="secondary">{typeCategories.length}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Dibuat{' '}
                              {new Date(category.createdAt).toLocaleDateString(
                                'id-ID',
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>Ubah informasi kategori</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Kategori</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Makanan, Transportasi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Jenis</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-4 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value
                        ? 'border-foreground'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2">
                {categoryIcons.map((icon) => (
                  <button
                    key={icon}
                    className={`w-8 h-8 text-lg rounded border-2 ${
                      formData.icon === icon
                        ? 'border-foreground'
                        : 'border-border'
                    }`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!formData.name}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
