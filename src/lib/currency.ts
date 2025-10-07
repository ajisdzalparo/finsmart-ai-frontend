import { useSettings } from '@/context/SettingsContext';

export function useCurrencyFormatter() {
  const { currency, locale } = useSettings();

  const format = (amount: number, options?: Intl.NumberFormatOptions) => {
    // Standardized to IDR, but keeping multi-currency support for future use
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency, // This will always be 'IDR' now
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  };

  return { format };
}

export function formatCurrencyStatic(
  amount: number,
  currency: string, // Standardized to 'IDR' but keeping parameter for flexibility
  locale: string,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency, // This will typically be 'IDR' now
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}
