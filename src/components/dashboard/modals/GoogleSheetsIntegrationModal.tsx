import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useAcquisitionFunnels } from '@/hooks/useAcquisitionFunnels';
import { useSDRFunnels } from '@/hooks/useSDRFunnels';
import { CheckCircle2, FileSpreadsheet, Settings, Sparkles, Target, Plus } from 'lucide-react';
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
  const { createIntegration, addFieldMappings, currentIntegration, loading } = useGoogleSheets(moduleName);

  // Hooks for funnels (conditionally used based on module)
  const acquisitionFunnels = useAcquisitionFunnels();
  const sdrFunnels = useSDRFunnels();

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
    funnel_id: '',
    funnel_name: '',
    field_mappings: [] as CardFieldMapping[],
  });

  const [isCreatingNewFunnel, setIsCreatingNewFunnel] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [creatingFunnel, setCreatingFunnel] = useState(false);

  // Get the appropriate funnels based on module
  const getModuleFunnels = () => {
    if (moduleName === 'aquisicao') {
      return acquisitionFunnels.funnels;
    } else if (moduleName === 'sdr') {
      return sdrFunnels.funnels;
    }
    return [];
  };

  // Check if module supports funnels
  const moduleHasFunnels = () => {
    return moduleName === 'aquisicao' || moduleName === 'sdr';
  };

  // Check if integration already exists for this module
  useEffect(() => {
    if (isOpen && currentIntegration && moduleHasFunnels()) {
      // Se já tem integração e o módulo tem funis, vai direto para seleção de funil
      setCurrentStep('select-funnel');
      // Preenche os dados da integração existente
      setFormData((prev) => ({
        ...prev,
        spreadsheet_id: currentIntegration.spreadsheet_id,
        spreadsheet_name: currentIntegration.spreadsheet_name || '',
        sheet_name: currentIntegration.sheet_name || 'Sheet1',
        auto_sync: currentIntegration.auto_sync,
        sync_frequency: currentIntegration.sync_frequency,
        sync_direction: currentIntegration.sync_direction || 'export',
        data_range: currentIntegration.data_range || '',
        has_header: currentIntegration.has_header ?? true,
      }));
    } else if (isOpen) {
      setCurrentStep('welcome');
    }
  }, [isOpen, currentIntegration]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldMappingChange = (cardId: string, mapping: CardFieldMapping) => {
    setFormData((prev) => {
      const existingIndex = prev.field_mappings.findIndex((m) => m.card_id === cardId);
      const newMappings = [...prev.field_mappings];

      // Adicionar funnel_id e funnel_name ao mapeamento
      const mappingWithFunnel = {
        ...mapping,
        funnel_id: prev.funnel_id || undefined,
        funnel_name: prev.funnel_name || undefined,
      };

      if (existingIndex >= 0) {
        newMappings[existingIndex] = mappingWithFunnel;
      } else {
        newMappings.push(mappingWithFunnel);
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

  // Handler for creating a new funnel
  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim()) return;

    setCreatingFunnel(true);
    try {
      let result;
      if (moduleName === 'aquisicao') {
        result = await acquisitionFunnels.createFunnel({
          name: newFunnelName.trim(),
          is_active: true,
        });
      } else if (moduleName === 'sdr') {
        result = await sdrFunnels.createFunnel({
          name: newFunnelName.trim(),
          is_active: true,
        });
      }

      if (result?.success && result.data) {
        // Set the newly created funnel as selected
        setFormData((prev) => ({
          ...prev,
          funnel_id: result.data.id,
          funnel_name: result.data.name,
        }));
        setIsCreatingNewFunnel(false);
        setNewFunnelName('');

        // Ir direto para o mapeamento após criar funil
        setCurrentStep('map-fields');
      }
    } finally {
      setCreatingFunnel(false);
    }
  };

  const handleComplete = async () => {
    // Se já existe integração, apenas adiciona os mapeamentos do novo funil
    if (currentIntegration) {
      console.log('📋 Integração já existe, adicionando mapeamentos para o funil:', formData.funnel_name);
      const success = await addFieldMappings(currentIntegration.id, formData.field_mappings);

      if (success) {
        setCurrentStep('complete');
        if (onComplete) {
          onComplete();
        }
      }
    } else {
      // Se não existe integração, cria uma nova com os mapeamentos
      console.log('🆕 Criando nova integração');
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
      funnel_id: '',
      funnel_name: '',
      field_mappings: [],
    });
    setIsCreatingNewFunnel(false);
    setNewFunnelName('');
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
                  // Se escolheu import ou both, vai para seleção de funil ou mapeamento
                  if (formData.sync_direction === 'import' || formData.sync_direction === 'both') {
                    // Se o módulo tem funis, vai para seleção de funil primeiro
                    if (moduleHasFunnels()) {
                      setCurrentStep('select-funnel');
                    } else {
                      setCurrentStep('map-fields');
                    }
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

      case 'select-funnel':
        const moduleFunnels = getModuleFunnels();

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">
                {currentIntegration ? 'Selecionar Funil' : 'Passo 3: Selecionar Funil'}
              </h3>
              <p className="text-muted-foreground">
                {currentIntegration
                  ? 'Selecione um funil existente ou crie um novo para configurar'
                  : 'Escolha o funil para o qual você quer configurar os mapeamentos de dados'
                }
              </p>
              {currentIntegration && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Integração já configurada com Google Sheets
                </div>
              )}
            </div>

            <div className="space-y-4">
              {!isCreatingNewFunnel ? (
                <>
                  {moduleFunnels.length > 0 ? (
                    <div className="space-y-3">
                      <Label>Selecione um funil existente:</Label>
                      <RadioGroup
                        value={formData.funnel_id}
                        onValueChange={(value) => {
                          const selectedFunnel = moduleFunnels.find((f) => f.id === value);
                          if (selectedFunnel) {
                            setFormData((prev) => ({
                              ...prev,
                              funnel_id: selectedFunnel.id,
                              funnel_name: selectedFunnel.name,
                            }));
                          }
                        }}
                      >
                        <div className="space-y-2">
                          {moduleFunnels.map((funnel) => (
                            <div
                              key={funnel.id}
                              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            >
                              <RadioGroupItem value={funnel.id} id={funnel.id} />
                              <Label
                                htmlFor={funnel.id}
                                className="flex-1 cursor-pointer font-normal"
                              >
                                <div className="font-medium">{funnel.name}</div>
                                {funnel.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {funnel.description}
                                  </div>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-2">
                        Nenhum funil encontrado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Crie um novo funil para começar
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCreatingNewFunnel(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Novo Funil
                  </Button>
                </>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="new-funnel-name">Nome do Novo Funil *</Label>
                    <Input
                      id="new-funnel-name"
                      placeholder="Ex: Campanha Facebook, Tráfego Orgânico..."
                      value={newFunnelName}
                      onChange={(e) => setNewFunnelName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsCreatingNewFunnel(false);
                        setNewFunnelName('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateFunnel}
                      disabled={!newFunnelName.trim() || creatingFunnel}
                    >
                      {creatingFunnel ? 'Criando...' : 'Criar Funil'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Você poderá configurar células diferentes para cada funil.
                Por exemplo, Funil A pode puxar dados da célula B5, e Funil B da célula B10.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep('configure')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentStep('map-fields')}
                className="flex-1"
                disabled={!formData.funnel_id}
              >
                Continuar para Mapeamento
              </Button>
            </div>
          </div>
        );

      case 'map-fields':
        const moduleCards = getModuleCards();

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                {moduleHasFunnels() ? 'Passo 4: Mapear Dados' : 'Passo 3: Mapear Dados'}
              </h3>
              <p className="text-muted-foreground">
                Configure de onde cada métrica/card virá na planilha
              </p>
              {formData.funnel_name && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Target className="w-4 h-4" />
                  Configurando: {formData.funnel_name}
                </div>
              )}
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
                  <Button
                    onClick={() => setCurrentStep(moduleHasFunnels() ? 'select-funnel' : 'configure')}
                    variant="outline"
                    className="flex-1"
                  >
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
