import React from 'react';
import { Input } from './input';
import { useSettings } from '@/context/SettingsContext';

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | string;
  onValueChange?: (value: number) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onValueChange,
  onChange,
  ...rest
}) => {
  const { locale } = useSettings();

  const normalizeToNumber = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.,-]/g, '')
      .replace(new RegExp(`\${new Intl.NumberFormat(locale).format(1111).replace(/1/g, '')}`,'g'), '')
      .replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(normalizeToNumber(e.target.value));
    }
    if (onChange) onChange(e);
  };

  return (
    <Input
      inputMode="decimal"
      type="text"
      value={value}
      onChange={handleChange}
      {...rest}
    />
  );
};


