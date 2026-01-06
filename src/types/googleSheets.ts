import { ModuleName } from './dashboard';

export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';
export type SyncStatus = 'success' | 'failed' | 'partial';
export type SyncType = 'manual' | 'automatic';
export type SyncDirection = 'export' | 'import' | 'both';

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
