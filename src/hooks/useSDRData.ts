import { useState, useEffect, useCallback } from 'react';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';
import type {
  SDRData,
  SDRDataInput,
  MonthCode,
  LeadClassification,
  SDRClassificationMetrics,
} from '@/types/funnel';

export const useSDRData = (funnelId: string | null) => {
  const { toast } = useToast();

  const [data, setData] = useState<SDRData[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<SDRData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data for the funnel
  const fetchData = useCallback(async (month?: MonthCode, year?: number) => {
    if (!funnelId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('sdr_data')
        .select('*')
        .eq('funnel_id', funnelId);

      if (month) {
        query = query.eq('month', month);
      }

      if (year) {
        query = query.eq('year', year);
      }

      query = query.order('year', { ascending: false }).order('month', { ascending: false });

      const { data: result, error } = await query;

      if (error) throw error;

      setData((result as SDRData[]) || []);

      // Se pesquisou por mês específico, setar como currentMonthData
      if (month && year && result && result.length > 0) {
        setCurrentMonthData(result[0] as SDRData);
      }
    } catch (error: any) {
      console.error('Error fetching SDR data:', error);
      toast({
        title: 'Erro ao carregar dados SDR',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [funnelId, toast]);

  // Upsert data (create or update)
  const upsertData = async (input: SDRDataInput) => {
    try {
      const { data: result, error } = await supabase
        .from('sdr_data')
        .upsert(input, {
          onConflict: 'funnel_id,month,year',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Dados salvos!',
        description: 'Os dados SDR foram atualizados.',
      });

      // Refresh data
      await fetchData();

      return { success: true, data: result as SDRData };
    } catch (error: any) {
      console.error('Error saving SDR data:', error);
      toast({
        title: 'Erro ao salvar dados',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Calculate metrics for a specific classification
  const calculateClassificationMetrics = (
    data: SDRData,
    classification: LeadClassification
  ): SDRClassificationMetrics => {
    const leads = data[`leads_${classification}` as keyof SDRData] as number;
    const agendamentos = data[`agendamentos_${classification}` as keyof SDRData] as number;
    const calls = data[`calls_${classification}` as keyof SDRData] as number;
    const vendas = data[`vendas_${classification}` as keyof SDRData] as number;

    const taxa_agendamento = leads > 0 ? (agendamentos / leads) * 100 : 0;
    const taxa_comparecimento = agendamentos > 0 ? (calls / agendamentos) * 100 : 0;
    const taxa_conversao = calls > 0 ? (vendas / calls) * 100 : 0;

    return {
      classification,
      leads,
      agendamentos,
      calls,
      vendas,
      taxa_agendamento: Number(taxa_agendamento.toFixed(2)),
      taxa_comparecimento: Number(taxa_comparecimento.toFixed(2)),
      taxa_conversao: Number(taxa_conversao.toFixed(2)),
    };
  };

  // Calculate overall metrics (all classifications combined)
  const calculateOverallMetrics = (data: SDRData): SDRClassificationMetrics => {
    return {
      classification: 'geral',
      leads: data.total_leads,
      agendamentos: data.total_agendamentos,
      calls: data.total_calls,
      vendas: data.total_vendas,
      taxa_agendamento: data.taxa_agendamento_geral,
      taxa_comparecimento: data.taxa_comparecimento_geral,
      taxa_conversao: data.taxa_conversao_geral,
    };
  };

  // Get all metrics (by classification and overall)
  const getAllMetrics = (data: SDRData): SDRClassificationMetrics[] => {
    const classifications: LeadClassification[] = ['diamante', 'ouro', 'prata', 'bronze'];

    return [
      ...classifications.map(c => calculateClassificationMetrics(data, c)),
      calculateOverallMetrics(data),
    ];
  };

  // Calculate metrics across multiple months (aggregated)
  const calculateAggregatedMetrics = (dataList: SDRData[]): SDRClassificationMetrics => {
    if (dataList.length === 0) {
      return {
        classification: 'geral',
        leads: 0,
        agendamentos: 0,
        calls: 0,
        vendas: 0,
        taxa_agendamento: 0,
        taxa_comparecimento: 0,
        taxa_conversao: 0,
      };
    }

    const totals = dataList.reduce(
      (acc, d) => ({
        leads: acc.leads + d.total_leads,
        agendamentos: acc.agendamentos + d.total_agendamentos,
        calls: acc.calls + d.total_calls,
        vendas: acc.vendas + d.total_vendas,
      }),
      { leads: 0, agendamentos: 0, calls: 0, vendas: 0 }
    );

    const taxa_agendamento = totals.leads > 0
      ? (totals.agendamentos / totals.leads) * 100
      : 0;
    const taxa_comparecimento = totals.agendamentos > 0
      ? (totals.calls / totals.agendamentos) * 100
      : 0;
    const taxa_conversao = totals.calls > 0
      ? (totals.vendas / totals.calls) * 100
      : 0;

    return {
      classification: 'geral',
      ...totals,
      taxa_agendamento: Number(taxa_agendamento.toFixed(2)),
      taxa_comparecimento: Number(taxa_comparecimento.toFixed(2)),
      taxa_conversao: Number(taxa_conversao.toFixed(2)),
    };
  };

  // Load data when funnel changes
  useEffect(() => {
    if (funnelId) {
      fetchData();
    }
  }, [funnelId, fetchData]);

  return {
    data,
    currentMonthData,
    setCurrentMonthData,
    loading,
    fetchData,
    upsertData,
    calculateClassificationMetrics,
    calculateOverallMetrics,
    getAllMetrics,
    calculateAggregatedMetrics,
  };
};
