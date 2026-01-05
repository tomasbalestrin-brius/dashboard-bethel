import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  actions?: React.ReactNode;
}

export function MetricSection({
  title,
  description,
  icon: Icon,
  children,
  variant = 'default',
  className,
  actions,
}: MetricSectionProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-l-4 border-l-blue-500',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    danger: 'border-l-4 border-l-red-500',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
  };

  return (
    <Card className={cn('transition-all hover:shadow-lg', variantStyles[variant], className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn('p-2 rounded-lg bg-muted', iconStyles[variant])}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
