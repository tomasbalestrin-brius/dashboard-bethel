// =====================================================
// FUNNEL TYPES
// =====================================================
// Tipos TypeScript para o sistema de funis

// ===== TIPOS BASE =====

export type MonthCode = 'jan' | 'fev' | 'mar' | 'abr' | 'mai' | 'jun' | 'jul' | 'ago' | 'set' | 'out' | 'nov' | 'dez';

export type LeadClassification = 'diamante' | 'ouro' | 'prata' | 'bronze';

// ===== ACQUISITION FUNNELS (Funis de Aquisição) =====

export interface AcquisitionFunnel {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  connection_id?: string;
  monthly_investment: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AcquisitionFunnelData {
  id: string;
  funnel_id: string;
  month: MonthCode;
  year: number;
  total_leads: number;
  qualified_leads: number;
  scheduled: number;
  calls_done: number;
  sales: number;
  investment: number;
  cost_per_lead: number;      // Computed: investment / total_leads
  conversion_rate: number;    // Computed: (sales / qualified_leads) * 100
  created_at: string;
  updated_at: string;
}

// Input type para criar/atualizar funil de aquisição
export interface AcquisitionFunnelInput {
  name: string;
  description?: string;
  connection_id?: string;
  monthly_investment?: number;
  is_active?: boolean;
}

// Input type para criar/atualizar dados do funil de aquisição
export interface AcquisitionFunnelDataInput {
  funnel_id: string;
  month: MonthCode;
  year: number;
  total_leads?: number;
  qualified_leads?: number;
  scheduled?: number;
  calls_done?: number;
  sales?: number;
  investment?: number;
}

// ===== SDR FUNNELS (Funis SDR) =====

export interface SDRFunnel {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SDRData {
  id: string;
  funnel_id: string;
  month: MonthCode;
  year: number;

  // Leads por classificação
  leads_diamante: number;
  leads_ouro: number;
  leads_prata: number;
  leads_bronze: number;

  // Agendamentos por classificação
  agendamentos_diamante: number;
  agendamentos_ouro: number;
  agendamentos_prata: number;
  agendamentos_bronze: number;

  // Calls por classificação
  calls_diamante: number;
  calls_ouro: number;
  calls_prata: number;
  calls_bronze: number;

  // Vendas por classificação
  vendas_diamante: number;
  vendas_ouro: number;
  vendas_prata: number;
  vendas_bronze: number;

  // Totais (computed)
  total_leads: number;
  total_agendamentos: number;
  total_calls: number;
  total_vendas: number;

  // Taxas gerais (computed)
  taxa_agendamento_geral: number;
  taxa_comparecimento_geral: number;
  taxa_conversao_geral: number;

  created_at: string;
  updated_at: string;
}

// Input type para criar/atualizar funil SDR
export interface SDRFunnelInput {
  name: string;
  description?: string;
  owner_id?: string;
  is_active?: boolean;
}

// Input type para criar/atualizar dados SDR
export interface SDRDataInput {
  funnel_id: string;
  month: MonthCode;
  year: number;

  // Leads por classificação
  leads_diamante?: number;
  leads_ouro?: number;
  leads_prata?: number;
  leads_bronze?: number;

  // Agendamentos por classificação
  agendamentos_diamante?: number;
  agendamentos_ouro?: number;
  agendamentos_prata?: number;
  agendamentos_bronze?: number;

  // Calls por classificação
  calls_diamante?: number;
  calls_ouro?: number;
  calls_prata?: number;
  calls_bronze?: number;

  // Vendas por classificação
  vendas_diamante?: number;
  vendas_ouro?: number;
  vendas_prata?: number;
  vendas_bronze?: number;
}

// ===== CALCULATED METRICS (Métricas Calculadas) =====

export interface SDRClassificationMetrics {
  classification: LeadClassification | 'geral';
  leads: number;
  agendamentos: number;
  calls: number;
  vendas: number;
  taxa_agendamento: number;      // agendamentos / leads * 100
  taxa_comparecimento: number;   // calls / agendamentos * 100
  taxa_conversao: number;         // vendas / calls * 100
}

export interface AcquisitionMetrics {
  total_leads: number;
  qualified_leads: number;
  scheduled: number;
  calls_done: number;
  sales: number;
  investment: number;
  cost_per_lead: number;
  conversion_rate: number;
  roi: number; // Pode ser calculado: (receita - investimento) / investimento * 100
}

// ===== FUNNEL VIEW OPTIONS =====

export type FunnelViewMode = 'individual' | 'overview';

export interface FunnelSelectorOption {
  value: string;
  label: string;
  isActive: boolean;
}

// ===== UTILITY TYPES =====

// Helper para criar tipos de formulário com Zod
export type FunnelFormData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Helper para respostas de API
export interface FunnelApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ===== CONSTANTS =====

export const MONTHS: Record<MonthCode, string> = {
  jan: 'Janeiro',
  fev: 'Fevereiro',
  mar: 'Março',
  abr: 'Abril',
  mai: 'Maio',
  jun: 'Junho',
  jul: 'Julho',
  ago: 'Agosto',
  set: 'Setembro',
  out: 'Outubro',
  nov: 'Novembro',
  dez: 'Dezembro',
};

export const LEAD_CLASSIFICATIONS: Record<LeadClassification, { label: string; color: string; icon: string }> = {
  diamante: {
    label: 'Diamante',
    color: '#60A5FA', // blue-400
    icon: '💎',
  },
  ouro: {
    label: 'Ouro',
    color: '#FBBF24', // yellow-400
    icon: '🥇',
  },
  prata: {
    label: 'Prata',
    color: '#9CA3AF', // gray-400
    icon: '🥈',
  },
  bronze: {
    label: 'Bronze',
    color: '#F97316', // orange-500
    icon: '🥉',
  },
};
