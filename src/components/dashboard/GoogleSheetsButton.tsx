import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileSpreadsheet, Settings, Upload, Clock, ExternalLink } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { GoogleSheetsIntegrationModal } from './modals/GoogleSheetsIntegrationModal';
import { useToast } from '@/hooks/use-toast';
import type { ModuleName } from '@/types/dashboard';
import type { SyncDataRow, ModuleSyncConfig } from '@/types/googleSheets';

interface GoogleSheetsButtonProps {
  moduleName: ModuleName;
  data?: SyncDataRow[];
  syncConfig?: ModuleSyncConfig;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function GoogleSheetsButton({
  moduleName,
  data = [],
  syncConfig,
  variant = 'outline',
  size = 'default',
}: GoogleSheetsButtonProps) {
  const { toast } = useToast();
  const { currentIntegration, syncToGoogleSheets, loading } = useGoogleSheets(moduleName);

  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const hasIntegration = !!currentIntegration;

  const handleSync = async () => {
    if (!currentIntegration || !syncConfig) {
      toast({
        title: 'Erro',
        description: 'Integração não configurada ou dados não disponíveis',
        variant: 'destructive',
      });
      return;
    }

    if (data.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para sincronizar no momento',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncToGoogleSheets(currentIntegration.id, data, syncConfig);

      if (result.success) {
        toast({
          title: 'Sincronização concluída',
          description: (
            <div className="flex flex-col gap-2">
              <p>{result.rows_synced} linhas sincronizadas com sucesso</p>
              {result.spreadsheet_url && (
                <a
                  href={result.spreadsheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  Abrir planilha <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ),
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSpreadsheet = () => {
    if (currentIntegration?.spreadsheet_id) {
      window.open(
        `https://docs.google.com/spreadsheets/d/${currentIntegration.spreadsheet_id}`,
        '_blank'
      );
    }
  };

  const formatLastSync = (lastSyncedAt?: string): string => {
    if (!lastSyncedAt) return 'Nunca sincronizado';

    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (!hasIntegration) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowIntegrationModal(true)}
          disabled={loading}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Integrar Sheets
        </Button>

        <GoogleSheetsIntegrationModal
          isOpen={showIntegrationModal}
          onClose={() => setShowIntegrationModal(false)}
          moduleName={moduleName}
          onComplete={() => {
            toast({
              title: 'Integração configurada',
              description: 'Agora você pode sincronizar seus dados com o Google Sheets',
            });
          }}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={loading || isSyncing}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isSyncing ? 'Sincronizando...' : 'Sheets'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <p className="text-sm font-medium">{currentIntegration.spreadsheet_name || 'Planilha'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              {formatLastSync(currentIntegration.last_synced_at)}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
            <Upload className="w-4 h-4 mr-2" />
            Sincronizar Agora
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenSpreadsheet}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Planilha
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowIntegrationModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GoogleSheetsIntegrationModal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        moduleName={moduleName}
      />
    </>
  );
}
