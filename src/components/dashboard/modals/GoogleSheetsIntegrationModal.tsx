import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { CheckCircle2, FileSpreadsheet, Settings, Sparkles } from 'lucide-react';
import type { ModuleName } from '@/types/dashboard';
import type { GoogleSheetsSetupStep, SyncFrequency } from '@/types/googleSheets';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: ModuleName;
  onComplete?: () => void;
}

export function GoogleSheetsIntegrationModal({
  isOpen,
  onClose,
  moduleName,
  onComplete,
}: GoogleSheetsIntegrationModalProps) {
  const { createIntegration, initiateOAuthFlow, loading } = useGoogleSheets(moduleName);

  const [currentStep, setCurrentStep] = useState<GoogleSheetsSetupStep>('welcome');
  const [formData, setFormData] = useState({
    spreadsheet_id: '',
    spreadsheet_name: '',
    sheet_name: 'Sheet1',
    auto_sync: false,
    sync_frequency: 'manual' as SyncFrequency,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthorize = async () => {
    const authUrl = await initiateOAuthFlow(moduleName);
    window.open(authUrl, '_blank', 'width=600,height=700');
    setCurrentStep('select-spreadsheet');
  };

  const extractSpreadsheetId = (url: string): string => {
    // Extract ID from URL like: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleSpreadsheetInput = (value: string) => {
    const id = extractSpreadsheetId(value);
    handleChange('spreadsheet_id', id);
  };

  const handleComplete = async () => {
    const integration = await createIntegration({
      module_name: moduleName,
      spreadsheet_id: formData.spreadsheet_id,
      spreadsheet_name: formData.spreadsheet_name || undefined,
      sheet_name: formData.sheet_name,
      auto_sync: formData.auto_sync,
      sync_frequency: formData.sync_frequency,
    });

    if (integration) {
      setCurrentStep('complete');
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleClose = () => {
    setCurrentStep('welcome');
    setFormData({
      spreadsheet_id: '',
      spreadsheet_name: '',
      sheet_name: 'Sheet1',
      auto_sync: false,
      sync_frequency: 'manual',
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <FileSpreadsheet className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Integração com Google Sheets</h3>
              <p className="text-muted-foreground">
                Conecte seus dados do módulo <strong>{moduleName}</strong> ao Google Sheets
                e mantenha suas planilhas sempre atualizadas.
              </p>
            </div>

            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Benefícios da integração:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Exportação automática ou manual de dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Sincronização em tempo real (opcional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Compartilhe relatórios com sua equipe facilmente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Crie dashboards personalizados no Google Sheets</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Button onClick={() => setCurrentStep('authorize')} className="w-full" size="lg">
                Começar Integração
              </Button>
            </div>
          </div>
        );

      case 'authorize':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Passo 1: Autorizar Acesso</h3>
              <p className="text-muted-foreground">
                Você será redirecionado para autorizar o acesso à sua conta Google.
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium">Instruções:</h4>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Clique no botão "Autorizar com Google" abaixo</li>
                <li>Faça login com sua conta Google (se necessário)</li>
                <li>Permita o acesso ao Google Sheets</li>
                <li>Aguarde o redirecionamento de volta para esta página</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('welcome')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleAuthorize} className="flex-1">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-4 h-4 mr-2"
                />
                Autorizar com Google
              </Button>
            </div>
          </div>
        );

      case 'select-spreadsheet':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Passo 2: Selecionar Planilha</h3>
              <p className="text-muted-foreground">
                Informe a planilha do Google Sheets onde os dados serão sincronizados.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spreadsheet-url">URL ou ID da Planilha *</Label>
                <Input
                  id="spreadsheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
                  value={formData.spreadsheet_id}
                  onChange={(e) => handleSpreadsheetInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL completa ou apenas o ID da planilha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spreadsheet-name">Nome da Planilha (opcional)</Label>
                <Input
                  id="spreadsheet-name"
                  placeholder="Ex: Relatório de Vendas"
                  value={formData.spreadsheet_name}
                  onChange={(e) => handleChange('spreadsheet_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheet-name">Nome da Aba</Label>
                <Input
                  id="sheet-name"
                  placeholder="Sheet1"
                  value={formData.sheet_name}
                  onChange={(e) => handleChange('sheet_name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nome da aba onde os dados serão inseridos
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('authorize')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentStep('configure')}
                className="flex-1"
                disabled={!formData.spreadsheet_id}
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Passo 3: Configurar Sincronização</h3>
              <p className="text-muted-foreground">
                Defina como e quando os dados devem ser sincronizados.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync" className="text-base">Sincronização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar automaticamente os dados
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={formData.auto_sync}
                  onCheckedChange={(checked) => handleChange('auto_sync', checked)}
                />
              </div>

              {formData.auto_sync && (
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Frequência de Sincronização</Label>
                  <Select
                    value={formData.sync_frequency}
                    onValueChange={(value) => handleChange('sync_frequency', value)}
                  >
                    <SelectTrigger id="sync-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="manual">Manual (apenas quando solicitado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Dica:</strong> Você poderá sincronizar manualmente a qualquer momento,
                  independente desta configuração.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('select-spreadsheet')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                {loading ? 'Criando...' : 'Concluir Integração'}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Integração Concluída!</h3>
              <p className="text-muted-foreground">
                Sua integração com Google Sheets foi configurada com sucesso.
              </p>
            </div>

            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium">Próximos passos:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Clique no botão "Sheets" para sincronizar dados a qualquer momento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Acesse sua planilha no Google Sheets para visualizar os dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>
                    {formData.auto_sync
                      ? 'Os dados serão sincronizados automaticamente'
                      : 'Sincronize manualmente quando desejar'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Fechar
              </Button>
              <Button
                onClick={() => {
                  window.open(
                    `https://docs.google.com/spreadsheets/d/${formData.spreadsheet_id}`,
                    '_blank'
                  );
                }}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Abrir Planilha
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integração Google Sheets
          </DialogTitle>
          <DialogDescription>
            Configure a integração para sincronizar dados do módulo {moduleName}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
