// =====================================================
// Daily Data Types for SDR and Monetization
// =====================================================

// Period selection types
export type PeriodPreset = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

export interface PeriodData {
  startDate: Date;
  endDate: Date;
  preset?: PeriodPreset;
}

// =====================================================
// SDR Daily Data
// =====================================================

export interface SDRDailyData {
  id: string;
  organization_id: string;
  funnel_id: string;
  data_date: string; // ISO date string

  // Leads totais que entraram
  leads_total: number;

  // Pessoas que responderam formulário
  responderam_formulario: number;

  // MQL por classificação
  mql_diamante: number;
  mql_ouro: number;
  mql_prata: number;
  mql_bronze: number;

  // Agendamentos por classificação
  agendamentos_diamante: number;
  agendamentos_ouro: number;
  agendamentos_prata: number;
  agendamentos_bronze: number;

  // Calls realizadas por classificação
  calls_diamante: number;
  calls_ouro: number;
  calls_prata: number;
  calls_bronze: number;

  // Vendas por classificação
  vendas_diamante: number;
  vendas_ouro: number;
  vendas_prata: number;
  vendas_bronze: number;

  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SDRDailyDataInput {
  funnel_id: string;
  data_date: string;
  leads_total: number;
  responderam_formulario: number;
  mql_diamante: number;
  mql_ouro: number;
  mql_prata: number;
  mql_bronze: number;
  agendamentos_diamante: number;
  agendamentos_ouro: number;
  agendamentos_prata: number;
  agendamentos_bronze: number;
  calls_diamante: number;
  calls_ouro: number;
  calls_prata: number;
  calls_bronze: number;
  vendas_diamante: number;
  vendas_ouro: number;
  vendas_prata: number;
  vendas_bronze: number;
}

// =====================================================
// Monetization Daily Data
// =====================================================

export interface MonetizationDailyData {
  id: string;
  organization_id: string;
  data_date: string; // ISO date string

  // Dados financeiros
  faturamento: number;
  entrada: number;

  // Alunos qualificados
  alunos_qualificados: number;

  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonetizationDailyDataInput {
  data_date: string;
  faturamento: number;
  entrada: number;
  alunos_qualificados: number;
}

// =====================================================
// Aggregated Data (for period analysis)
// =====================================================

export interface AggregatedSDRData {
  // Totais do período
  total_leads: number;
  total_responderam_formulario: number;

  // Totais de MQL por classificação
  total_mql_diamante: number;
  total_mql_ouro: number;
  total_mql_prata: number;
  total_mql_bronze: number;
  total_mql: number; // Soma de todos

  // Totais de agendamentos
  total_agendamentos_diamante: number;
  total_agendamentos_ouro: number;
  total_agendamentos_prata: number;
  total_agendamentos_bronze: number;
  total_agendamentos: number;

  // Totais de calls
  total_calls_diamante: number;
  total_calls_ouro: number;
  total_calls_prata: number;
  total_calls_bronze: number;
  total_calls: number;

  // Totais de vendas
  total_vendas_diamante: number;
  total_vendas_ouro: number;
  total_vendas_prata: number;
  total_vendas_bronze: number;
  total_vendas: number;

  // Período
  period: PeriodData;
}

export interface AggregatedMonetizationData {
  total_faturamento: number;
  total_entrada: number;
  total_alunos_qualificados: number;

  // Período
  period: PeriodData;
}

// =====================================================
// Calculated Metrics
// =====================================================

export interface SDRMetrics {
  // Taxas principais
  taxa_resposta_formulario: number; // (responderam_formulario / leads_total) * 100
  taxa_mql: number; // (total_mql / responderam_formulario) * 100
  taxa_agendamento: number; // (total_agendamentos / total_mql) * 100
  taxa_comparecimento: number; // (total_calls / total_agendamentos) * 100
  taxa_conversao: number; // (total_vendas / total_calls) * 100

  // Breakdown de MQL por classificação (percentuais)
  percentual_mql_diamante: number;
  percentual_mql_ouro: number;
  percentual_mql_prata: number;
  percentual_mql_bronze: number;

  // Dados absolutos para display
  mql_diamante: number;
  mql_ouro: number;
  mql_prata: number;
  mql_bronze: number;
  total_mql: number;
}

export interface MonetizationMetrics {
  faturamento: number;
  entrada: number;
  alunos_qualificados: number;
  receita_por_aluno: number; // faturamento / alunos_qualificados
}

export interface AcquisitionMetrics {
  numero_alunos: number;
  custo_por_lead: number; // investido / numero_alunos
  faturamento: number;
  investido: number;
  roas: number; // faturamento / investido
}

export interface GeneralMetrics {
  taxa_ascensao: number; // (total_vendas / total_mql) * 100
  total_vendas: number;
  total_mql: number;
}

// Combined dashboard metrics
export interface DashboardMetrics {
  acquisition: AcquisitionMetrics;
  sdr: SDRMetrics;
  monetization: MonetizationMetrics;
  general: GeneralMetrics;
  period: PeriodData;
}

// =====================================================
// Helper types for classification breakdown
// =====================================================

export type LeadClassificationType = 'diamante' | 'ouro' | 'prata' | 'bronze';

export interface ClassificationData {
  classification: LeadClassificationType;
  mql: number;
  agendamentos: number;
  calls: number;
  vendas: number;
  percentual: number;
}

export interface MQLBreakdown {
  diamante: ClassificationData;
  ouro: ClassificationData;
  prata: ClassificationData;
  bronze: ClassificationData;
  total: number;
}

// =====================================================
// Validation schemas
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// =====================================================
// Data history for table display
// =====================================================

export interface DataHistoryItem {
  id: string;
  date: string;
  data: SDRDailyData | MonetizationDailyData;
  canEdit: boolean;
  canDelete: boolean;
}

export interface DataHistoryFilters {
  startDate?: string;
  endDate?: string;
  funnelId?: string;
}

// =====================================================
// Period options for selector
// =====================================================

export interface PeriodOption {
  value: PeriodPreset;
  label: string;
  description?: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'today', label: 'Hoje', description: 'Apenas hoje' },
  { value: 'last7days', label: 'Últimos 7 dias', description: '7 dias atrás até hoje' },
  { value: 'last30days', label: 'Últimos 30 dias', description: '30 dias atrás até hoje' },
  { value: 'thisMonth', label: 'Este mês', description: 'Mês atual completo' },
  { value: 'lastMonth', label: 'Mês passado', description: 'Mês anterior completo' },
  { value: 'custom', label: 'Período customizado', description: 'Selecione datas específicas' },
];

// =====================================================
// Utility functions for period calculation
// =====================================================

export function getPeriodDates(preset: PeriodPreset): PeriodData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (preset) {
    case 'today':
      startDate = new Date(today);
      break;

    case 'last7days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      break;

    case 'last30days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      break;

    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;

    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    default:
      startDate = new Date(today);
  }

  return { startDate, endDate, preset };
}

export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
