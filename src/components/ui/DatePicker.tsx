import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  id?: string;
  value?: string; // yyyy-MM-dd
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map((v) => Number(v));
  if (!y || !m || !d) return undefined;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt;
}

function toIsoDate(date?: Date): string {
  if (!date) return '';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  required,
  className,
}: DatePickerProps) {
  const selected = React.useMemo(() => parseIsoDate(value), [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
          aria-required={required}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange?.(toIsoDate(date))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = 'DatePicker';
