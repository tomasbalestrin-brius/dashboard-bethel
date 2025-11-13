import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'danger';
}

export function ProfileCard({
  title,
  description,
  icon,
  children,
  variant = 'default',
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl rounded-xl p-6 border',
        variant === 'default' && 'bg-slate-800/50 border-slate-700/50',
        variant === 'danger' && 'bg-red-500/10 border-red-500/50'
      )}
    >
      <div className="flex items-start gap-3 mb-6">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
