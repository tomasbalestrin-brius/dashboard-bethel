import { useState, useEffect } from 'react';
import { PeriodSelector } from '../PeriodSelector';
import { MetricSection } from '../metrics/MetricSection';
import { MetricCard } from '../metrics/MetricCard';
import { PrimaryMetric } from '../metrics/PrimaryMetric';
import { MQLBreakdown } from '../metrics/MQLBreakdown';
import { useSDRDailyData } from '@/hooks/useSDRDailyData';
import { useMonetizationDailyData } from '@/hooks/useMonetizationDailyData';
import { useAcquisitionFunnels } from '@/hooks/useAcquisitionFunnels';
import { useSDRFunnels } from '@/hooks/useSDRFunnels';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PhoneCall,
  Calendar,
  CheckCircle,
  ShoppingCart,
  Coins,
  GraduationCap,
  Star,
} from 'lucide-react';
import type {
  PeriodData,
  AggregatedSDRData,
  AggregatedMonetizationData,
  SDRMetrics,
  MonetizationMetrics,
  AcquisitionMetrics,
  GeneralMetrics,
  MQLBreakdownType,
} from '@/types/dailyData';
import { getPeriodDates, formatDateForDB } from '@/types/dailyData';
import {
  aggregateSDRData,
  aggregateMonetizationData,
  calculateSDRMetrics,
  calculateMonetizationMetrics,
  calculateAcquisitionMetrics,
  calculateGeneralMetrics,
  formatCurrency,
  formatPercentage,
  formatNumber,
} from '@/utils/metricsCalculations';

interface DashboardModuleProps {
  allData: any;
  currentMonth: string;
  currentProduct: string;
  currentWeek: string;
  onMonthSelect: (monthId: string) => void;
  onProductSelect: (productId: string) => void;
  onWeekChange: (week: string) => void;
}

export function DashboardModule({
  currentMonth,
  onMonthSelect,
}: DashboardModuleProps) {
  // Period state
  const [period, setPeriod] = useState<PeriodData>(getPeriodDates('last30days'));

  // Hooks
  const { funnels: sdrFunnels } = useSDRFunnels();
  const { getDataByPeriod: getSDRData } = useSDRDailyData();
  const { getDataByPeriod: getMonetizationData } = useMonetizationDailyData();
  const { funnelData: acquisitionData } = useAcquisitionFunnels();

  // State for aggregated data
  const [sdrAggregated, setSDRAggregated] = useState<AggregatedSDRData | null>(null);
  const [monetizationAggregated, setMonetizationAggregated] = useState<AggregatedMonetizationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load and aggregate data when period changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const startDate = formatDateForDB(period.startDate);
        const endDate = formatDateForDB(period.endDate);

        // Aggregate SDR data across all funnels
        const allSDRData = [];
        for (const funnel of sdrFunnels) {
          const funnelData = await getSDRData(funnel.id, startDate, endDate);
          allSDRData.push(...funnelData);
        }

        // Group SDR data by date and sum across funnels
        const sdrByDate = new Map();
        allSDRData.forEach((data) => {
          const existing = sdrByDate.get(data.data_date);
          if (existing) {
            // Sum all fields
            Object.keys(data).forEach((key) => {
              if (typeof data[key] === 'number') {
                existing[key] = (existing[key] || 0) + data[key];
              }
            });
          } else {
            sdrByDate.set(data.data_date, { ...data });
          }
        });

        const aggregatedSDR = aggregateSDRData(Array.from(sdrByDate.values()), period);
        setSDRAggregated(aggregatedSDR);

        // Aggregate Monetization data
        const monetizationData = await getMonetizationData(startDate, endDate);
        const aggregatedMonetization = aggregateMonetizationData(monetizationData, period);
        setMonetizationAggregated(aggregatedMonetization);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sdrFunnels.length > 0) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [period, sdrFunnels, getSDRData, getMonetizationData]);

  // Calculate metrics
  const sdrMetrics: SDRMetrics | null = sdrAggregated ? calculateSDRMetrics(sdrAggregated) : null;
  const monetizationMetrics: MonetizationMetrics | null = monetizationAggregated
    ? calculateMonetizationMetrics(monetizationAggregated)
    : null;

  // Calculate acquisition metrics from monthly data
  const acquisitionMetrics: AcquisitionMetrics = acquisitionData.length > 0
    ? calculateAcquisitionMetrics(
        acquisitionData.reduce((sum, d) => sum + d.total_leads, 0),
        acquisitionData.reduce((sum, d) => sum + d.investment, 0),
        monetizationAggregated?.total_faturamento || 0,
        acquisitionData.reduce((sum, d) => sum + d.qualified_leads, 0)
      )
    : { numero_alunos: 0, custo_por_lead: 0, faturamento: 0, investido: 0, roas: 0 };

  // Calculate general metrics (Taxa de Ascensão)
  const generalMetrics: GeneralMetrics = sdrAggregated
    ? calculateGeneralMetrics(sdrAggregated.total_vendas, sdrAggregated.total_mql)
    : { taxa_ascensao: 0, total_vendas: 0, total_mql: 0 };

  // Prepare MQL breakdown
  const mqlBreakdown: MQLBreakdownType | null = sdrAggregated && sdrMetrics
    ? {
        diamante: {
          count: sdrAggregated.total_mql_diamante,
          percentage: sdrMetrics.percentual_mql_diamante,
          agendamentos: sdrAggregated.total_agendamentos_diamante,
          calls: sdrAggregated.total_calls_diamante,
          vendas: sdrAggregated.total_vendas_diamante,
        },
        ouro: {
          count: sdrAggregated.total_mql_ouro,
          percentage: sdrMetrics.percentual_mql_ouro,
          agendamentos: sdrAggregated.total_agendamentos_ouro,
          calls: sdrAggregated.total_calls_ouro,
          vendas: sdrAggregated.total_vendas_ouro,
        },
        prata: {
          count: sdrAggregated.total_mql_prata,
          percentage: sdrMetrics.percentual_mql_prata,
          agendamentos: sdrAggregated.total_agendamentos_prata,
          calls: sdrAggregated.total_calls_prata,
          vendas: sdrAggregated.total_vendas_prata,
        },
        bronze: {
          count: sdrAggregated.total_mql_bronze,
          percentage: sdrMetrics.percentual_mql_bronze,
          agendamentos: sdrAggregated.total_agendamentos_bronze,
          calls: sdrAggregated.total_calls_bronze,
          vendas: sdrAggregated.total_vendas_bronze,
        },
      }
    : null;

  if (loading) {
    return (
      <div className="text-center p-20">
        <div className="text-5xl mb-4">⏳</div>
        <div className="text-xl text-muted-foreground">Carregando métricas do dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-4 font-extrabold max-md:text-3xl">
          📊 Dashboard Geral
        </h1>
        <p className="text-xl text-muted-foreground max-md:text-sm">
          Visão completa de Aquisição, SDR, Monetização e Performance Geral
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* SECTION 4: GERAL - Taxa de Ascensão (PRIMARY/HIGHLIGHTED) */}
      <MetricSection
        title="GERAL"
        icon={Star}
        description="Indicador principal de conversão: do MQL ao Cliente"
        variant="primary"
      >
        <PrimaryMetric
          value={generalMetrics.taxa_ascensao}
          subtitle="Taxa de Ascensão (MQL → Cliente)"
          formula={`${formatNumber(generalMetrics.total_vendas)} vendas ÷ ${formatNumber(generalMetrics.total_mql)} MQLs`}
        />
      </MetricSection>

      {/* SECTION 1: AQUISIÇÃO */}
      <MetricSection
        title="AQUISIÇÃO"
        icon={Target}
        description="Métricas de geração de leads e investimento"
        variant="default"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Número de Alunos"
            value={formatNumber(acquisitionMetrics.numero_alunos)}
            icon={Users}
            variant="default"
            size="md"
          />
          <MetricCard
            label="Custo por Lead"
            value={formatCurrency(acquisitionMetrics.custo_por_lead)}
            icon={DollarSign}
            variant="default"
            size="md"
          />
          <MetricCard
            label="Faturamento"
            value={formatCurrency(acquisitionMetrics.faturamento)}
            icon={ShoppingCart}
            variant="success"
            size="md"
          />
          <MetricCard
            label="Investido"
            value={formatCurrency(acquisitionMetrics.investido)}
            icon={TrendingUp}
            variant="default"
            size="md"
          />
          <MetricCard
            label="ROAS"
            value={`${acquisitionMetrics.roas.toFixed(2)}x`}
            icon={BarChart3}
            variant={acquisitionMetrics.roas >= 3 ? 'success' : acquisitionMetrics.roas >= 1.5 ? 'warning' : 'danger'}
            size="md"
            subtitle="Return on Ad Spend"
          />
        </div>
      </MetricSection>

      {/* SECTION 2: SDR */}
      <MetricSection
        title="SDR"
        icon={PhoneCall}
        description="Métricas de qualificação e conversão de leads"
        variant="default"
      >
        <div className="space-y-6">
          {/* SDR Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              label="Taxa de Resposta"
              value={sdrMetrics ? formatPercentage(sdrMetrics.taxa_resposta_formulario) : '0%'}
              icon={Users}
              variant="default"
              size="md"
              subtitle="Leads que responderam"
            />
            <MetricCard
              label="Taxa de MQL"
              value={sdrMetrics ? formatPercentage(sdrMetrics.taxa_mql) : '0%'}
              icon={CheckCircle}
              variant="default"
              size="md"
              subtitle="Responderam → MQL"
            />
            <MetricCard
              label="Taxa de Agendamento"
              value={sdrMetrics ? formatPercentage(sdrMetrics.taxa_agendamento) : '0%'}
              icon={Calendar}
              variant="default"
              size="md"
              subtitle="MQL → Agendado"
            />
            <MetricCard
              label="Taxa de Comparecimento"
              value={sdrMetrics ? formatPercentage(sdrMetrics.taxa_comparecimento) : '0%'}
              icon={PhoneCall}
              variant="default"
              size="md"
              subtitle="Agendado → Call"
            />
            <MetricCard
              label="Taxa de Conversão"
              value={sdrMetrics ? formatPercentage(sdrMetrics.taxa_conversao) : '0%'}
              icon={ShoppingCart}
              variant={sdrMetrics && sdrMetrics.taxa_conversao >= 20 ? 'success' : 'default'}
              size="md"
              subtitle="Call → Venda"
            />
          </div>

          {/* MQL Breakdown */}
          {mqlBreakdown && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Breakdown de MQL por Classificação</h3>
              <MQLBreakdown breakdown={mqlBreakdown} />
            </div>
          )}
        </div>
      </MetricSection>

      {/* SECTION 3: MONETIZAÇÃO */}
      <MetricSection
        title="MONETIZAÇÃO"
        icon={Coins}
        description="Métricas financeiras e receita"
        variant="default"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Faturamento (Vendas)"
            value={monetizationMetrics ? formatCurrency(monetizationMetrics.faturamento) : formatCurrency(0)}
            icon={DollarSign}
            variant="success"
            size="lg"
          />
          <MetricCard
            label="Entrada (Caixa)"
            value={monetizationMetrics ? formatCurrency(monetizationMetrics.entrada) : formatCurrency(0)}
            icon={Coins}
            variant="default"
            size="lg"
          />
          <MetricCard
            label="Receita por Aluno"
            value={monetizationMetrics ? formatCurrency(monetizationMetrics.receita_por_aluno) : formatCurrency(0)}
            icon={GraduationCap}
            variant="primary"
            size="lg"
            subtitle={
              monetizationMetrics && monetizationMetrics.alunos_qualificados > 0
                ? `${formatNumber(monetizationMetrics.alunos_qualificados)} alunos qualificados`
                : 'Sem dados de alunos'
            }
          />
        </div>
      </MetricSection>
    </div>
  );
}
