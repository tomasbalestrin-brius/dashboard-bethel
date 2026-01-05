import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PeriodPreset, PeriodData } from '@/types/dailyData';
import { getPeriodDates, PERIOD_OPTIONS } from '@/types/dailyData';
import type { DateRange } from 'react-day-picker';

interface PeriodSelectorProps {
  value: PeriodData;
  onChange: (period: PeriodData) => void;
  className?: string;
}

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>(value.preset || 'last30days');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: value.startDate,
    to: value.endDate,
  });

  const handlePresetChange = (preset: PeriodPreset) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      setIsCustomOpen(true);
    } else {
      const period = getPeriodDates(preset);
      onChange(period);
      setIsCustomOpen(false);
    }
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setCustomRange(range);

    if (range?.from && range?.to) {
      onChange({
        startDate: range.from,
        endDate: range.to,
        preset: 'custom',
      });
      setIsCustomOpen(false);
    }
  };

  const formatPeriod = () => {
    if (selectedPreset === 'custom') {
      if (customRange?.from && customRange?.to) {
        return `${format(customRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(
          customRange.to,
          'dd/MM/yy',
          { locale: ptBR }
        )}`;
      }
      return 'Selecionar período';
    }

    const option = PERIOD_OPTIONS.find((opt) => opt.value === selectedPreset);
    return option?.label || 'Selecionar período';
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Preset buttons */}
      {PERIOD_OPTIONS.filter((opt) => opt.value !== 'custom').map((option) => (
        <Button
          key={option.value}
          variant={selectedPreset === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetChange(option.value)}
          className="transition-all"
        >
          {option.label}
        </Button>
      ))}

      {/* Custom period selector */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedPreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn('transition-all', selectedPreset === 'custom' && 'min-w-[200px]')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedPreset === 'custom' ? formatPeriod() : 'Período customizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
            disabled={(date) => date > new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
