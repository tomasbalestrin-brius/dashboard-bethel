import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, Star } from 'lucide-react';

interface PrimaryMetricProps {
  value: number;
  subtitle: string;
  formula?: string;
  className?: string;
}

export function PrimaryMetric({ value, subtitle, formula, className }: PrimaryMetricProps) {
  const getColorClass = (val: number) => {
    if (val >= 75) return 'text-green-600 dark:text-green-400';
    if (val >= 50) return 'text-blue-600 dark:text-blue-400';
    if (val >= 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBgColorClass = (val: number) => {
    if (val >= 75) return 'from-green-500/20 to-green-600/20';
    if (val >= 50) return 'from-blue-500/20 to-blue-600/20';
    if (val >= 25) return 'from-yellow-500/20 to-yellow-600/20';
    return 'from-red-500/20 to-red-600/20';
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all hover:shadow-2xl',
        'bg-gradient-to-br',
        getBgColorClass(value),
        className
      )}
    >
      <CardContent className="p-8 text-center">
        {/* Star decoration */}
        <div className="absolute top-4 right-4">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Indicador Principal
            </h3>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{subtitle}</h2>
        </div>

        {/* Value */}
        <div className="relative">
          <div className={cn('text-8xl font-extrabold leading-none mb-4', getColorClass(value))}>
            {value.toFixed(2)}%
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          </div>
        </div>

        {/* Formula */}
        {formula && (
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-mono">{formula}</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-out',
                value >= 75
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : value >= 50
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                  : value >= 25
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
