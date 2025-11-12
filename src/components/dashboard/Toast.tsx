import { useEffect } from 'react';
import type { Toast as ToastType } from '@/types/dashboard';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-2xl
        bg-[hsl(var(--bg-secondary))] border-2
        ${toast.type === 'success' ? 'border-[hsl(var(--success))]' : ''}
        ${toast.type === 'error' ? 'border-[hsl(var(--danger))]' : ''}
        ${toast.type === 'warning' ? 'border-[hsl(var(--warning))]' : ''}
        ${toast.type === 'info' ? 'border-[hsl(var(--accent-primary))]' : ''}
        animate-in slide-in-from-right duration-300
      `}
    >
      <div className="text-2xl flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm text-[hsl(var(--text-secondary))]">
        {toast.message}
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-md:top-20 max-md:left-2.5 max-md:right-2.5">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
