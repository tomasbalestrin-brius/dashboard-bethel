import { useOnlineStatus } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-medium z-50 animate-fade-in">
      📡 Modo Offline - Dados podem estar desatualizados
    </div>
  );
}
