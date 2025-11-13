import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps {
  loading: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  className?: string;
}

export function LoadingButton({
  loading,
  children,
  onClick,
  type = 'submit',
  variant = 'default',
  disabled = false,
  className,
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative transition-all',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
