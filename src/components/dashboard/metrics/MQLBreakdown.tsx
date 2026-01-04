import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MQLBreakdown as MQLBreakdownType } from '@/types/dailyData';

interface MQLBreakdownProps {
  breakdown: MQLBreakdownType;
  className?: string;
}

const classificationConfig = {
  diamante: {
    label: 'Diamante',
    icon: '💎',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  ouro: {
    label: 'Ouro',
    icon: '🥇',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
  },
  prata: {
    label: 'Prata',
    icon: '🥈',
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
  bronze: {
    label: 'Bronze',
    icon: '🥉',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
};

export function MQLBreakdown({ breakdown, className }: MQLBreakdownProps) {
  const classifications = ['diamante', 'ouro', 'prata', 'bronze'] as const;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            📋 Separação dos MQL
          </h4>
          <p className="text-2xl font-bold text-foreground">
            {breakdown.total.toLocaleString('pt-BR')} <span className="text-base font-normal text-muted-foreground">MQL no total</span>
          </p>
        </div>

        <div className="space-y-3">
          {classifications.map((classification) => {
            const data = breakdown[classification];
            const config = classificationConfig[classification];

            return (
              <div key={classification} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn('text-lg font-bold', config.textColor)}>
                      {data.mql}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({data.percentual.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                      config.color
                    )}
                    style={{ width: `${data.percentual}%` }}
                  />
                </div>

                {/* Additional metrics on hover */}
                <div className="grid grid-cols-3 gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={cn('text-xs p-1.5 rounded', config.bgColor)}>
                    <p className="text-muted-foreground">Agendamentos</p>
                    <p className={cn('font-semibold', config.textColor)}>{data.agendamentos}</p>
                  </div>
                  <div className={cn('text-xs p-1.5 rounded', config.bgColor)}>
                    <p className="text-muted-foreground">Calls</p>
                    <p className={cn('font-semibold', config.textColor)}>{data.calls}</p>
                  </div>
                  <div className={cn('text-xs p-1.5 rounded', config.bgColor)}>
                    <p className="text-muted-foreground">Vendas</p>
                    <p className={cn('font-semibold', config.textColor)}>{data.vendas}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
