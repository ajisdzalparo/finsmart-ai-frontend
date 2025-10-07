import { useSettings } from '@/context/SettingsContext';

export function useCurrencyFormatter() {
  const { currency, locale } = useSettings();

  const format = (amount: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  };

  return { format };
}

export function formatCurrencyStatic(
  amount: number,
  currency: string,
  locale: string,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}
