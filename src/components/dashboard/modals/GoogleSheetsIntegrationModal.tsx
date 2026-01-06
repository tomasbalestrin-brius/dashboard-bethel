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
import type { GoogleSheetsSetupStep, SyncFrequency, CardFieldMapping } from '@/types/googleSheets';
import { MODULE_CARDS } from '@/types/googleSheets';
import { CardFieldMappingConfig } from '@/components/dashboard/CardFieldMappingConfig';

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
  const { createIntegration, loading } = useGoogleSheets(moduleName);

  const [currentStep, setCurrentStep] = useState<GoogleSheetsSetupStep>('welcome');
  const [formData, setFormData] = useState({
    spreadsheet_id: '',
    spreadsheet_name: '',
    sheet_name: 'Sheet1',
    auto_sync: false,
    sync_frequency: 'manual' as SyncFrequency,
    sync_direction: 'export' as 'export' | 'import' | 'both',
    data_range: '',
    has_header: true,
    field_mappings: [] as CardFieldMapping[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldMappingChange = (cardId: string, mapping: CardFieldMapping) => {
    setFormData((prev) => {
      const existingIndex = prev.field_mappings.findIndex((m) => m.card_id === cardId);
      const newMappings = [...prev.field_mappings];

      if (existingIndex >= 0) {
        newMappings[existingIndex] = mapping;
      } else {
        newMappings.push(mapping);
      }

      return { ...prev, field_mappings: newMappings };
    });
  };

  const getModuleCards = () => MODULE_CARDS[moduleName] || [];

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
      sync_direction: formData.sync_direction,
      data_range: formData.data_range || undefined,
      has_header: formData.has_header,
      field_mappings: formData.field_mappings,
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
      sync_direction: 'export',
      data_range: '',
      has_header: true,
      field_mappings: [],
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
              <Button onClick={() => setCurrentStep('select-spreadsheet')} className="w-full" size="lg">
                Começar Integração
              </Button>
            </div>
          </div>
        );

      case 'select-spreadsheet':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Passo 1: Selecionar Planilha</h3>
              <p className="text-muted-foreground">
                Informe a planilha do Google Sheets onde os dados serão sincronizados.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spreadsheet-url">URL da Planilha Google Sheets *</Label>
                <Input
                  id="spreadsheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
                  value={formData.spreadsheet_id}
                  onChange={(e) => handleSpreadsheetInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL completa da sua planilha Google Sheets
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  📋 Como preparar sua planilha:
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Abra sua planilha no Google Sheets</li>
                  <li>Clique em <strong>"Compartilhar"</strong></li>
                  <li>Selecione <strong>"Qualquer pessoa com o link"</strong></li>
                  <li>Defina permissão como <strong>"Editor"</strong> (para exportar dados)</li>
                  <li>Copie a URL e cole aqui</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spreadsheet-name">Nome da Planilha (opcional)</Label>
                <Input
                  id="spreadsheet-name"
                  placeholder="Ex: Dados Monetização"
                  value={formData.spreadsheet_name}
                  onChange={(e) => handleChange('spreadsheet_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheet-name">Nome da Aba *</Label>
                <Input
                  id="sheet-name"
                  placeholder="Sheet1"
                  value={formData.sheet_name}
                  onChange={(e) => handleChange('sheet_name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nome da aba onde os dados serão lidos/escritos
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('welcome')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentStep('configure')}
                className="flex-1"
                disabled={!formData.spreadsheet_id || !formData.sheet_name}
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
              <h3 className="text-xl font-semibold">Passo 2: Configurar Dados</h3>
              <p className="text-muted-foreground">
                Defina quais dados exportar e importar da planilha.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold">Direção dos Dados</Label>
                  </div>

                  <Select
                    value={formData.sync_direction || 'export'}
                    onValueChange={(value) => handleChange('sync_direction', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="export">
                        📤 Exportar (Sistema → Google Sheets)
                      </SelectItem>
                      <SelectItem value="import">
                        📥 Importar (Google Sheets → Sistema)
                      </SelectItem>
                      <SelectItem value="both">
                        🔄 Ambos (Exportar e Importar)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label className="text-base font-semibold">Intervalo de Dados na Planilha</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Ex: A1:Z1000 ou Sheet1!A:Z"
                      value={formData.data_range || ''}
                      onChange={(e) => handleChange('data_range', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Especifique o intervalo de células (ex: A1:E100). Deixe vazio para usar a aba inteira.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label className="text-base font-semibold">Primeira Linha é Cabeçalho?</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="has-header"
                      checked={formData.has_header !== false}
                      onCheckedChange={(checked) => handleChange('has_header', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      Sim, a primeira linha contém nomes das colunas
                    </span>
                  </div>
                </div>
              </div>

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
                  💡 <strong>Dica:</strong> Você poderá sincronizar manualmente a qualquer momento.
                  O sistema vai {formData.sync_direction === 'export' ? 'enviar' : formData.sync_direction === 'import' ? 'buscar' : 'enviar e buscar'} dados conforme configurado.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('select-spreadsheet')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={() => {
                  // Se escolheu import ou both, vai para mapeamento
                  if (formData.sync_direction === 'import' || formData.sync_direction === 'both') {
                    setCurrentStep('map-fields');
                  } else {
                    // Se é só export, vai direto para concluir
                    handleComplete();
                  }
                }}
                className="flex-1"
                disabled={loading}
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'map-fields':
        const moduleCards = getModuleCards();

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Passo 3: Mapear Dados</h3>
              <p className="text-muted-foreground">
                Configure de onde cada métrica/card virá na planilha
              </p>
            </div>

            {moduleCards.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-muted-foreground">
                  Este módulo não possui cards configuráveis.
                </p>
                <Button onClick={handleComplete} disabled={loading}>
                  Continuar sem Mapeamento
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
                  {moduleCards.map((card) => {
                    const existingMapping = formData.field_mappings.find(
                      (m) => m.card_id === card.id
                    );

                    return (
                      <CardFieldMappingConfig
                        key={card.id}
                        card={card}
                        mapping={existingMapping || null}
                        onChange={(mapping) => handleFieldMappingChange(card.id, mapping)}
                      />
                    );
                  })}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Dica:</strong> Você pode deixar cards em branco se não quiser importar dados para eles.
                    Apenas os cards com origem configurada terão dados importados.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setCurrentStep('configure')} variant="outline" className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                    {loading ? 'Criando...' : 'Concluir Integração'}
                  </Button>
                </div>
              </>
            )}
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
