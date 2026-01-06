import { ModuleName } from './dashboard';

export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';
export type SyncStatus = 'success' | 'failed' | 'partial';
export type SyncType = 'manual' | 'automatic';
export type SyncDirection = 'export' | 'import' | 'both';
export type AggregationType = 'value' | 'sum' | 'average' | 'count' | 'last' | 'formula';
export type DataFormat = 'number' | 'currency' | 'percentage' | 'text' | 'date';

export interface GoogleSheetsIntegration {
  id: string;
  organization_id: string;
  created_by: string;

  // Integration details
  module_name: ModuleName;
  spreadsheet_id: string;
  spreadsheet_name?: string;
  sheet_name?: string;

  // OAuth credentials (não usado mais, mas mantido para compatibilidade)
  access_token?: string;
  refresh_token?: string;
  token_expiry?: string;

  // Sync settings
  auto_sync: boolean;
  sync_frequency: SyncFrequency;
  sync_direction?: SyncDirection;
  data_range?: string;
  has_header?: boolean;
  last_synced_at?: string;

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsSyncHistory {
  id: string;
  integration_id: string;

  // Sync details
  sync_type: SyncType;
  status: SyncStatus;
  rows_synced: number;
  error_message?: string;

  // Metadata
  synced_at: string;
  synced_by?: string;
}

export interface GoogleSheetsIntegrationInput {
  module_name: ModuleName;
  spreadsheet_id: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  auto_sync?: boolean;
  sync_frequency?: SyncFrequency;
  sync_direction?: SyncDirection;
  data_range?: string;
  has_header?: boolean;
  field_mappings?: CardFieldMapping[];
}

// Mapeamento granular de campos/cards
export interface CardFieldMapping {
  card_id: string;
  card_name: string;
  source_type: 'cell' | 'range' | 'formula';
  source_value: string; // Ex: "B5", "D10:D50", "=(E10/E11)*100"
  aggregation: AggregationType;
  format: DataFormat;
  custom_formula?: string; // Só se aggregation === 'formula'
}

// Tabela separada para mapeamentos (mais escalável)
export interface GoogleSheetsFieldMapping {
  id: string;
  integration_id: string;
  card_id: string;
  card_name: string;
  source_type: 'cell' | 'range' | 'formula';
  source_value: string;
  aggregation: AggregationType;
  format: DataFormat;
  custom_formula?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleSheetsSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  rows_synced: number;
  error_message?: string;
  spreadsheet_url?: string;
}

// Setup wizard steps
export type GoogleSheetsSetupStep =
  | 'welcome'
  | 'authorize'
  | 'select-spreadsheet'
  | 'configure'
  | 'map-fields'
  | 'complete';

export interface GoogleSheetsSetupState {
  step: GoogleSheetsSetupStep;
  spreadsheet_id?: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  auto_sync: boolean;
  sync_frequency: SyncFrequency;
  access_token?: string;
  refresh_token?: string;
}

// Module-specific data structures for sync
export interface SyncDataRow {
  [key: string]: string | number | boolean | null;
}

export interface ModuleSyncConfig {
  module_name: ModuleName;
  headers: string[];
  formatData: (data: any) => SyncDataRow[];
}

// Definição de cards disponíveis por módulo
export interface ModuleCard {
  id: string;
  name: string;
  description: string;
  defaultFormat: DataFormat;
}

export const MODULE_CARDS: Record<ModuleName, ModuleCard[]> = {
  'dashboard': [],
  'resumo': [
    { id: 'total_leads', name: 'Total de Leads', description: 'Quantidade total de leads', defaultFormat: 'number' },
    { id: 'agendamentos', name: 'Agendamentos', description: 'Total de agendamentos', defaultFormat: 'number' },
    { id: 'calls', name: 'Calls Realizados', description: 'Total de calls', defaultFormat: 'number' },
    { id: 'vendas', name: 'Vendas', description: 'Total de vendas', defaultFormat: 'number' },
    { id: 'investimento', name: 'Investimento', description: 'Investimento total', defaultFormat: 'currency' },
    { id: 'roi', name: 'ROI', description: 'Retorno sobre investimento', defaultFormat: 'percentage' },
  ],
  'aquisicao': [
    { id: 'total_leads', name: 'Total de Leads', description: 'Total de leads gerados', defaultFormat: 'number' },
    { id: 'leads_qualificados', name: 'Leads Qualificados', description: 'Leads qualificados', defaultFormat: 'number' },
    { id: 'agendados', name: 'Agendados', description: 'Total de agendamentos', defaultFormat: 'number' },
    { id: 'calls_realizados', name: 'Calls Realizados', description: 'Calls realizados', defaultFormat: 'number' },
    { id: 'vendas', name: 'Vendas', description: 'Total de vendas', defaultFormat: 'number' },
    { id: 'investimento', name: 'Investimento', description: 'Investimento em marketing', defaultFormat: 'currency' },
    { id: 'custo_por_lead', name: 'Custo por Lead', description: 'Custo médio por lead', defaultFormat: 'currency' },
  ],
  'sdr': [
    { id: 'leads', name: 'Leads', description: 'Total de leads', defaultFormat: 'number' },
    { id: 'agendamentos', name: 'Agendamentos', description: 'Agendamentos realizados', defaultFormat: 'number' },
    { id: 'calls', name: 'Calls', description: 'Calls realizados', defaultFormat: 'number' },
    { id: 'vendas', name: 'Vendas', description: 'Vendas fechadas', defaultFormat: 'number' },
    { id: 'taxa_agendamento', name: 'Taxa de Agendamento', description: 'Percentual de agendamento', defaultFormat: 'percentage' },
    { id: 'taxa_comparecimento', name: 'Taxa de Comparecimento', description: 'Percentual de comparecimento', defaultFormat: 'percentage' },
    { id: 'taxa_conversao', name: 'Taxa de Conversão', description: 'Percentual de conversão', defaultFormat: 'percentage' },
  ],
  'monetizacao': [
    { id: 'receita_bruta', name: 'Receita Bruta', description: 'Receita bruta total', defaultFormat: 'currency' },
    { id: 'receita_liquida', name: 'Receita Líquida', description: 'Receita líquida', defaultFormat: 'currency' },
    { id: 'custos_operacionais', name: 'Custos Operacionais', description: 'Custos operacionais', defaultFormat: 'currency' },
    { id: 'margem_bruta', name: 'Margem Bruta', description: 'Margem bruta', defaultFormat: 'percentage' },
    { id: 'margem_liquida', name: 'Margem Líquida', description: 'Margem líquida', defaultFormat: 'percentage' },
    { id: 'roi', name: 'ROI', description: 'Retorno sobre investimento', defaultFormat: 'percentage' },
  ],
  'roi': [
    { id: 'receita', name: 'Receita', description: 'Receita total', defaultFormat: 'currency' },
    { id: 'investimento_total', name: 'Investimento Total', description: 'Investimento total', defaultFormat: 'currency' },
    { id: 'roi_percentual', name: 'ROI %', description: 'ROI em percentual', defaultFormat: 'percentage' },
    { id: 'margem_lucro', name: 'Margem de Lucro', description: 'Margem de lucro', defaultFormat: 'percentage' },
  ],
  'custos': [
    { id: 'total_mensal', name: 'Total Mensal', description: 'Total de custos do mês', defaultFormat: 'currency' },
    { id: 'custo_medio', name: 'Custo Médio', description: 'Custo médio', defaultFormat: 'currency' },
  ],
  'insights': [],
  'comparar-funis': [
    { id: 'leads', name: 'Leads', description: 'Total de leads', defaultFormat: 'number' },
    { id: 'conversoes', name: 'Conversões', description: 'Total de conversões', defaultFormat: 'number' },
    { id: 'taxa_conversao', name: 'Taxa de Conversão', description: 'Taxa de conversão', defaultFormat: 'percentage' },
    { id: 'receita', name: 'Receita', description: 'Receita total', defaultFormat: 'currency' },
    { id: 'roi', name: 'ROI', description: 'ROI do funil', defaultFormat: 'percentage' },
  ],
  'exportar': [],
};

// Pre-configured module sync configurations
export const MODULE_SYNC_CONFIGS: Record<ModuleName, ModuleSyncConfig | null> = {
  'dashboard': null,
  'resumo': {
    module_name: 'resumo',
    headers: ['Data', 'Leads', 'Agendamentos', 'Calls', 'Vendas', 'Investimento', 'ROI'],
    formatData: (data: any) => [data]
  },
  'aquisicao': {
    module_name: 'aquisicao',
    headers: ['Data', 'Funil', 'Total Leads', 'Leads Qualificados', 'Agendados', 'Calls Realizados', 'Vendas', 'Investimento', 'Custo por Lead'],
    formatData: (data: any) => [data]
  },
  'sdr': {
    module_name: 'sdr',
    headers: ['Data', 'Funil SDR', 'Classificação', 'Leads', 'Agendamentos', 'Calls', 'Vendas', 'Taxa Agendamento %', 'Taxa Comparecimento %', 'Taxa Conversão %'],
    formatData: (data: any) => [data]
  },
  'monetizacao': {
    module_name: 'monetizacao',
    headers: ['Data', 'Receita Bruta', 'Receita Líquida', 'Custos Operacionais', 'Margem Bruta', 'Margem Líquida', 'ROI %'],
    formatData: (data: any) => [data]
  },
  'roi': {
    module_name: 'roi',
    headers: ['Data', 'Receita', 'Investimento Total', 'ROI %', 'Margem de Lucro'],
    formatData: (data: any) => [data]
  },
  'custos': {
    module_name: 'custos',
    headers: ['Data', 'Categoria', 'Descrição', 'Valor', 'Total Mensal'],
    formatData: (data: any) => [data]
  },
  'insights': null,
  'comparar-funis': {
    module_name: 'comparar-funis',
    headers: ['Funil', 'Leads', 'Conversões', 'Taxa de Conversão %', 'Receita', 'ROI %'],
    formatData: (data: any) => [data]
  },
  'exportar': null,
};
