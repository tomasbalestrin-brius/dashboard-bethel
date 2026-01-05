import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { MonetizationDailyInput } from '@/components/dashboard/monetization/MonetizationDailyInput';
import { MetricCard } from '@/components/dashboard/metrics/MetricCard';
import { MetricSection } from '@/components/dashboard/metrics/MetricSection';
import { DollarSign, TrendingUp, Users, Coins } from 'lucide-react';
import { useMonetizationDailyData } from '@/hooks/useMonetizationDailyData';
import { getPeriodDates } from '@/types/dailyData';
import type { PeriodData } from '@/types/dailyData';
import {
  aggregateMonetizationData,
  calculateMonetizationMetrics,
  formatCurrency,
  formatNumber,
} from '@/utils/metricsCalculations';

interface MonetizationModuleProps {
  currentMonth?: string;
  onMonthSelect?: (monthId: string) => void;
}

export function MonetizationModule({ currentMonth, onMonthSelect }: MonetizationModuleProps) {
  const { getDataByPeriod, refreshData } = useMonetizationDailyData();

  // Use function initializer to avoid creating new object on every render
  const [period, setPeriod] = useState<PeriodData>(() => getPeriodDates('last30days'));
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Memoize period dates to prevent unnecessary re-renders
  const periodDates = useMemo(() => ({
    startDate: period.startDate.toISOString().split('T')[0],
    endDate: period.endDate.toISOString().split('T')[0],
  }), [period.startDate, period.endDate]);

  // Load data for selected period
  useEffect(() => {
    const loadData = async () => {
      if (!getDataByPeriod) {
        console.log('getDataByPeriod not available yet');
        return;
      }

      setLoading(true);
      try {
        const data = await getDataByPeriod(periodDates.startDate, periodDates.endDate);
        const aggregated = aggregateMonetizationData(data, period);
        setAggregatedData(aggregated);
      } catch (error) {
        console.error('Error loading monetization data:', error);
        setAggregatedData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodDates.startDate, periodDates.endDate]);

  const metrics = aggregatedData
    ? calculateMonetizationMetrics(aggregatedData)
    : {
        faturamento: 0,
        entrada: 0,
        alunos_qualificados: 0,
        receita_por_aluno: 0,
      };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">💰 Monetização</h1>
        <p className="text-muted-foreground">
          Acompanhe faturamento, entrada e receita por aluno
        </p>
      </div>

      {/* Period Selector */}
      <PeriodSelector value={period} onChange={setPeriod} />

      {/* Daily Input */}
      <MonetizationDailyInput />

      {/* Metrics */}
      <MetricSection
        title="Métricas do Período"
        description={`${period.startDate.toLocaleDateString('pt-BR')} - ${period.endDate.toLocaleDateString('pt-BR')}`}
        icon={TrendingUp}
        variant="success"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Faturamento Total"
            value={formatCurrency(metrics.faturamento)}
            icon={DollarSign}
            variant="success"
            subtitle="Vendas do período"
          />

          <MetricCard
            label="Entrada (Caixa)"
            value={formatCurrency(metrics.entrada)}
            icon={Coins}
            variant="primary"
            subtitle="Entrada em caixa"
          />

          <MetricCard
            label="Alunos Qualificados"
            value={formatNumber(metrics.alunos_qualificados)}
            icon={Users}
            variant="default"
            subtitle="Total de alunos"
          />

          <MetricCard
            label="Receita por Aluno"
            value={formatCurrency(metrics.receita_por_aluno)}
            icon={TrendingUp}
            variant="warning"
            subtitle="Faturamento ÷ Alunos"
            size="lg"
          />
        </div>
      </MetricSection>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição Financeira</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Faturamento</span>
                <span className="font-semibold">{formatCurrency(metrics.faturamento)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Entrada</span>
                <span className="font-semibold">{formatCurrency(metrics.entrada)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{
                    width: `${
                      metrics.faturamento > 0 ? (metrics.entrada / metrics.faturamento) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {metrics.faturamento > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Taxa de Entrada:{' '}
                  <span className="font-semibold">
                    {((metrics.entrada / metrics.faturamento) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance por Aluno</h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Receita Média por Aluno</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(metrics.receita_por_aluno)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Total Alunos</p>
                <p className="text-xl font-bold">{formatNumber(metrics.alunos_qualificados)}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Faturamento</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.faturamento)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
