// =====================================================
// Metrics Calculations Utilities
// =====================================================

import type {
  SDRDailyData,
  MonetizationDailyData,
  AggregatedSDRData,
  AggregatedMonetizationData,
  SDRMetrics,
  MonetizationMetrics,
  AcquisitionMetrics,
  GeneralMetrics,
  DashboardMetrics,
  PeriodData,
  MQLBreakdown,
  ClassificationData,
} from '@/types/dailyData';

// =====================================================
// Aggregation Functions
// =====================================================

/**
 * Aggregate daily SDR data for a period
 */
export function aggregateSDRData(
  dailyData: SDRDailyData[],
  period: PeriodData
): AggregatedSDRData {
  const aggregated: AggregatedSDRData = {
    total_leads: 0,
    total_responderam_formulario: 0,

    total_mql_diamante: 0,
    total_mql_ouro: 0,
    total_mql_prata: 0,
    total_mql_bronze: 0,
    total_mql: 0,

    total_agendamentos_diamante: 0,
    total_agendamentos_ouro: 0,
    total_agendamentos_prata: 0,
    total_agendamentos_bronze: 0,
    total_agendamentos: 0,

    total_calls_diamante: 0,
    total_calls_ouro: 0,
    total_calls_prata: 0,
    total_calls_bronze: 0,
    total_calls: 0,

    total_vendas_diamante: 0,
    total_vendas_ouro: 0,
    total_vendas_prata: 0,
    total_vendas_bronze: 0,
    total_vendas: 0,

    period,
  };

  dailyData.forEach((day) => {
    aggregated.total_leads += day.leads_total;
    aggregated.total_responderam_formulario += day.responderam_formulario;

    // MQL
    aggregated.total_mql_diamante += day.mql_diamante;
    aggregated.total_mql_ouro += day.mql_ouro;
    aggregated.total_mql_prata += day.mql_prata;
    aggregated.total_mql_bronze += day.mql_bronze;

    // Agendamentos
    aggregated.total_agendamentos_diamante += day.agendamentos_diamante;
    aggregated.total_agendamentos_ouro += day.agendamentos_ouro;
    aggregated.total_agendamentos_prata += day.agendamentos_prata;
    aggregated.total_agendamentos_bronze += day.agendamentos_bronze;

    // Calls
    aggregated.total_calls_diamante += day.calls_diamante;
    aggregated.total_calls_ouro += day.calls_ouro;
    aggregated.total_calls_prata += day.calls_prata;
    aggregated.total_calls_bronze += day.calls_bronze;

    // Vendas
    aggregated.total_vendas_diamante += day.vendas_diamante;
    aggregated.total_vendas_ouro += day.vendas_ouro;
    aggregated.total_vendas_prata += day.vendas_prata;
    aggregated.total_vendas_bronze += day.vendas_bronze;
  });

  // Calculate totals
  aggregated.total_mql =
    aggregated.total_mql_diamante +
    aggregated.total_mql_ouro +
    aggregated.total_mql_prata +
    aggregated.total_mql_bronze;

  aggregated.total_agendamentos =
    aggregated.total_agendamentos_diamante +
    aggregated.total_agendamentos_ouro +
    aggregated.total_agendamentos_prata +
    aggregated.total_agendamentos_bronze;

  aggregated.total_calls =
    aggregated.total_calls_diamante +
    aggregated.total_calls_ouro +
    aggregated.total_calls_prata +
    aggregated.total_calls_bronze;

  aggregated.total_vendas =
    aggregated.total_vendas_diamante +
    aggregated.total_vendas_ouro +
    aggregated.total_vendas_prata +
    aggregated.total_vendas_bronze;

  return aggregated;
}

/**
 * Aggregate daily Monetization data for a period
 */
export function aggregateMonetizationData(
  dailyData: MonetizationDailyData[],
  period: PeriodData
): AggregatedMonetizationData {
  const aggregated: AggregatedMonetizationData = {
    total_faturamento: 0,
    total_entrada: 0,
    total_alunos_qualificados: 0,
    period,
  };

  dailyData.forEach((day) => {
    aggregated.total_faturamento += day.faturamento;
    aggregated.total_entrada += day.entrada;
    aggregated.total_alunos_qualificados += day.alunos_qualificados;
  });

  return aggregated;
}

// =====================================================
// Metrics Calculation Functions
// =====================================================

/**
 * Calculate SDR metrics from aggregated data
 */
export function calculateSDRMetrics(aggregated: AggregatedSDRData): SDRMetrics {
  const safeDiv = (a: number, b: number): number => (b > 0 ? (a / b) * 100 : 0);

  const metrics: SDRMetrics = {
    // Taxas principais
    taxa_resposta_formulario: safeDiv(
      aggregated.total_responderam_formulario,
      aggregated.total_leads
    ),
    taxa_mql: safeDiv(aggregated.total_mql, aggregated.total_responderam_formulario),
    taxa_agendamento: safeDiv(aggregated.total_agendamentos, aggregated.total_mql),
    taxa_comparecimento: safeDiv(aggregated.total_calls, aggregated.total_agendamentos),
    taxa_conversao: safeDiv(aggregated.total_vendas, aggregated.total_calls),

    // Breakdown de MQL
    percentual_mql_diamante: safeDiv(aggregated.total_mql_diamante, aggregated.total_mql),
    percentual_mql_ouro: safeDiv(aggregated.total_mql_ouro, aggregated.total_mql),
    percentual_mql_prata: safeDiv(aggregated.total_mql_prata, aggregated.total_mql),
    percentual_mql_bronze: safeDiv(aggregated.total_mql_bronze, aggregated.total_mql),

    // Dados absolutos
    mql_diamante: aggregated.total_mql_diamante,
    mql_ouro: aggregated.total_mql_ouro,
    mql_prata: aggregated.total_mql_prata,
    mql_bronze: aggregated.total_mql_bronze,
    total_mql: aggregated.total_mql,
  };

  // Round to 2 decimal places
  Object.keys(metrics).forEach((key) => {
    const k = key as keyof SDRMetrics;
    if (typeof metrics[k] === 'number') {
      (metrics as any)[k] = Number(metrics[k].toFixed(2));
    }
  });

  return metrics;
}

/**
 * Calculate Monetization metrics from aggregated data
 */
export function calculateMonetizationMetrics(
  aggregated: AggregatedMonetizationData
): MonetizationMetrics {
  const receita_por_aluno =
    aggregated.total_alunos_qualificados > 0
      ? aggregated.total_faturamento / aggregated.total_alunos_qualificados
      : 0;

  return {
    faturamento: aggregated.total_faturamento,
    entrada: aggregated.total_entrada,
    alunos_qualificados: aggregated.total_alunos_qualificados,
    receita_por_aluno: Number(receita_por_aluno.toFixed(2)),
  };
}

/**
 * Calculate Acquisition metrics
 * Note: Acquisition data comes from acquisition_funnel_data table
 */
export function calculateAcquisitionMetrics(data: {
  total_leads: number;
  investment: number;
  revenue: number;
}): AcquisitionMetrics {
  const custo_por_lead = data.total_leads > 0 ? data.investment / data.total_leads : 0;
  const roas = data.investment > 0 ? data.revenue / data.investment : 0;

  return {
    numero_alunos: data.total_leads,
    custo_por_lead: Number(custo_por_lead.toFixed(2)),
    faturamento: data.revenue,
    investido: data.investment,
    roas: Number(roas.toFixed(2)),
  };
}

/**
 * Calculate General metrics (Taxa de Ascensão)
 */
export function calculateGeneralMetrics(
  total_vendas: number,
  total_mql: number
): GeneralMetrics {
  const taxa_ascensao = total_mql > 0 ? (total_vendas / total_mql) * 100 : 0;

  return {
    taxa_ascensao: Number(taxa_ascensao.toFixed(2)),
    total_vendas,
    total_mql,
  };
}

/**
 * Calculate all dashboard metrics from period data
 */
export function calculateDashboardMetrics(
  sdrAggregated: AggregatedSDRData,
  monetizationAggregated: AggregatedMonetizationData,
  acquisitionData: { total_leads: number; investment: number; revenue: number },
  period: PeriodData
): DashboardMetrics {
  const sdrMetrics = calculateSDRMetrics(sdrAggregated);
  const monetizationMetrics = calculateMonetizationMetrics(monetizationAggregated);
  const acquisitionMetrics = calculateAcquisitionMetrics(acquisitionData);
  const generalMetrics = calculateGeneralMetrics(
    sdrAggregated.total_vendas,
    sdrAggregated.total_mql
  );

  return {
    acquisition: acquisitionMetrics,
    sdr: sdrMetrics,
    monetization: monetizationMetrics,
    general: generalMetrics,
    period,
  };
}

/**
 * Get MQL breakdown by classification with percentages
 */
export function getMQLBreakdown(aggregated: AggregatedSDRData): MQLBreakdown {
  const safeDiv = (a: number, b: number): number => (b > 0 ? (a / b) * 100 : 0);

  const createClassificationData = (
    classification: 'diamante' | 'ouro' | 'prata' | 'bronze',
    mql: number
  ): ClassificationData => ({
    classification,
    mql,
    agendamentos: aggregated[`total_agendamentos_${classification}`],
    calls: aggregated[`total_calls_${classification}`],
    vendas: aggregated[`total_vendas_${classification}`],
    percentual: Number(safeDiv(mql, aggregated.total_mql).toFixed(2)),
  });

  return {
    diamante: createClassificationData('diamante', aggregated.total_mql_diamante),
    ouro: createClassificationData('ouro', aggregated.total_mql_ouro),
    prata: createClassificationData('prata', aggregated.total_mql_prata),
    bronze: createClassificationData('bronze', aggregated.total_mql_bronze),
    total: aggregated.total_mql,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Validate SDR daily data input
 */
export function validateSDRDailyData(data: Partial<SDRDailyData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.funnel_id) errors.push('Funil é obrigatório');
  if (!data.data_date) errors.push('Data é obrigatória');

  // Check for negative values
  const numericFields = [
    'leads_total',
    'responderam_formulario',
    'mql_diamante',
    'mql_ouro',
    'mql_prata',
    'mql_bronze',
    'agendamentos_diamante',
    'agendamentos_ouro',
    'agendamentos_prata',
    'agendamentos_bronze',
    'calls_diamante',
    'calls_ouro',
    'calls_prata',
    'calls_bronze',
    'vendas_diamante',
    'vendas_ouro',
    'vendas_prata',
    'vendas_bronze',
  ];

  numericFields.forEach((field) => {
    const value = (data as any)[field];
    if (value !== undefined && value < 0) {
      errors.push(`${field} não pode ser negativo`);
    }
  });

  // Check date is not in the future
  if (data.data_date) {
    const dataDate = new Date(data.data_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (dataDate > today) {
      errors.push('Data não pode ser no futuro');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Monetization daily data input
 */
export function validateMonetizationDailyData(data: Partial<MonetizationDailyData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.data_date) errors.push('Data é obrigatória');

  // Check for negative values
  if (data.faturamento !== undefined && data.faturamento < 0) {
    errors.push('Faturamento não pode ser negativo');
  }
  if (data.entrada !== undefined && data.entrada < 0) {
    errors.push('Entrada não pode ser negativa');
  }
  if (data.alunos_qualificados !== undefined && data.alunos_qualificados < 0) {
    errors.push('Alunos qualificados não pode ser negativo');
  }

  // Check date is not in the future
  if (data.data_date) {
    const dataDate = new Date(data.data_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (dataDate > today) {
      errors.push('Data não pode ser no futuro');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
