import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  variant = 'default',
  size = 'md',
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800',
    success: 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800',
    warning: 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800',
    danger: 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800',
  };

  const valueStyles = {
    default: 'text-foreground',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const sizeStyles = {
    sm: {
      card: 'p-3',
      value: 'text-xl',
      label: 'text-xs',
      icon: 'w-4 h-4',
    },
    md: {
      card: 'p-4',
      value: 'text-2xl',
      label: 'text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      card: 'p-6',
      value: 'text-4xl',
      label: 'text-base',
      icon: 'w-6 h-6',
    },
  };

  const trendStyles = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant], className)}>
      <CardContent className={sizeStyles[size].card}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn('text-muted-foreground font-medium mb-1', sizeStyles[size].label)}>
              {label}
            </p>
            <p className={cn('font-bold leading-none mb-2', sizeStyles[size].value, valueStyles[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className={cn('flex items-center gap-1 text-xs font-medium mt-2', trendStyles[trend])}>
                <span>{trendIcons[trend]}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('text-muted-foreground/50', sizeStyles[size].icon)}>
              <Icon className="w-full h-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
