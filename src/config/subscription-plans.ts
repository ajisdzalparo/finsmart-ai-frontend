import { SubscriptionPlan } from '@/services/payment.service';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Paket gratis dengan fitur dasar',
    price: 0,
    currency: 'IDR',
    interval: 'monthly',
    features: [
      'basic_transactions',
      'basic_categories',
      'basic_goals',
      'basic_reports',
    ],
    maxTransactions: 50,
    maxGoals: 3,
    maxCategories: 10,
    hasAI: false,
    hasOCR: false,
    hasReports: true,
    hasExport: false,
    hasPrioritySupport: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Paket lengkap untuk pengguna individu',
    price: 49000,
    currency: 'IDR',
    interval: 'monthly',
    features: [
      'unlimited_transactions',
      'unlimited_goals',
      'unlimited_categories',
      'ai_insights',
      'ai_recommendations',
      'ocr_scan',
      'advanced_reports',
      'data_export',
      'priority_support',
      'backup_otomatis',
      'multi_device_sync',
      'dark_mode',
    ],
    hasAI: true,
    hasOCR: true,
    hasReports: true,
    hasExport: true,
    hasPrioritySupport: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solusi lengkap untuk perusahaan dan tim besar',
    price: 299000,
    currency: 'IDR',
    interval: 'monthly',
    features: [
      'unlimited_transactions',
      'unlimited_goals',
      'unlimited_categories',
      'ai_insights',
      'ai_recommendations',
      'ocr_scan',
      'advanced_reports',
      'data_export',
      'priority_support',
      'multi_user',
      'team_collaboration',
      'advanced_analytics',
      'custom_integrations',
      'dedicated_support',
      'sla_guarantee',
      'custom_development',
      'training_consultation',
    ],
    hasAI: true,
    hasOCR: true,
    hasReports: true,
    hasExport: true,
    hasPrioritySupport: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const PLAN_FEATURES = {
  basic_transactions: {
    name: 'Transaksi Dasar (50/bulan)',
    description:
      'Pencatatan transaksi harian dengan batas 50 transaksi per bulan',
    icon: '📝',
  },
  basic_categories: {
    name: 'Kategori Dasar (10 kategori)',
    description: 'Kategori pengeluaran/pemasukan dengan batas 10 kategori',
    icon: '🏷️',
  },
  basic_goals: {
    name: 'Goals Dasar (3 goals)',
    description: 'Atur tujuan keuangan dengan batas 3 goals',
    icon: '🎯',
  },
  basic_reports: {
    name: 'Laporan Dasar',
    description: 'Lihat ringkasan laporan keuangan',
    icon: '📊',
  },
  unlimited_transactions: {
    name: 'Transaksi Tanpa Batas',
    description: 'Catat transaksi tanpa batasan jumlah',
    icon: '♾️',
  },
  unlimited_goals: {
    name: 'Goals Tanpa Batas',
    description: 'Buat tujuan keuangan tanpa batasan',
    icon: '🎯',
  },
  unlimited_categories: {
    name: 'Kategori Tanpa Batas',
    description: 'Buat kategori tanpa batasan jumlah',
    icon: '🏷️',
  },
  ai_insights: {
    name: 'AI Insights',
    description: 'Analisis keuangan cerdas dengan AI',
    icon: '🤖',
  },
  ai_recommendations: {
    name: 'AI Recommendations',
    description: 'Rekomendasi optimasi keuangan personal',
    icon: '💡',
  },
  ocr_scan: {
    name: 'Scan Nota OCR',
    description: 'Upload foto nota untuk input otomatis',
    icon: '📷',
  },
  advanced_reports: {
    name: 'Laporan Lanjutan',
    description: 'Laporan keuangan detail dan analisis mendalam',
    icon: '📈',
  },
  data_export: {
    name: 'Export Data',
    description: 'Ekspor data ke Excel/PDF',
    icon: '📤',
  },
  priority_support: {
    name: 'Priority Support',
    description: 'Dukungan prioritas 24/7',
    icon: '🎧',
  },
  backup_otomatis: {
    name: 'Backup Otomatis',
    description: 'Backup data otomatis ke cloud',
    icon: '☁️',
  },
  multi_device_sync: {
    name: 'Multi-device Sync',
    description: 'Sinkronisasi data antar perangkat',
    icon: '🔄',
  },
  dark_mode: {
    name: 'Dark Mode',
    description: 'Tema gelap untuk kenyamanan mata',
    icon: '🌙',
  },
  multi_user: {
    name: 'Multi-user',
    description: 'Akses untuk hingga 5 pengguna',
    icon: '👥',
  },
  team_collaboration: {
    name: 'Team Collaboration',
    description: 'Kolaborasi tim dan berbagi data',
    icon: '🤝',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Analisis data keuangan tingkat lanjut',
    icon: '📊',
  },
  custom_integrations: {
    name: 'Custom Integrations',
    description: 'Integrasi dengan sistem bisnis Anda',
    icon: '🔗',
  },
  dedicated_support: {
    name: 'Dedicated Support',
    description: 'Dukungan khusus dengan account manager',
    icon: '👨‍💼',
  },
  sla_guarantee: {
    name: 'SLA Guarantee',
    description: 'Garansi uptime 99.9%',
    icon: '✅',
  },
  custom_development: {
    name: 'Custom Development',
    description: 'Pengembangan fitur sesuai kebutuhan',
    icon: '⚙️',
  },
  training_consultation: {
    name: 'Training & Consultation',
    description: 'Pelatihan dan konsultasi keuangan',
    icon: '🎓',
  },
};

export const getPlanFeatures = (plan: SubscriptionPlan) => {
  return plan.features.map((featureKey) => ({
    key: featureKey,
    ...PLAN_FEATURES[featureKey as keyof typeof PLAN_FEATURES],
  }));
};

export const getPlanIcon = (planName: string) => {
  switch (planName.toLowerCase()) {
    case 'free':
      return '🆓';
    case 'premium':
      return '👑';
    case 'enterprise':
      return '💎';
    default:
      return '📦';
  }
};

export const getPlanColor = (planName: string) => {
  switch (planName.toLowerCase()) {
    case 'free':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'premium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
