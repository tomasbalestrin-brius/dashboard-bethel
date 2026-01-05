import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';
import type {
  SDRDailyData,
  SDRDailyDataInput,
  AggregatedSDRData,
  PeriodData,
} from '@/types/dailyData';
import {
  aggregateSDRData,
  validateSDRDailyData,
  formatDateForDB,
} from '@/utils/metricsCalculations';

interface UseSDRDailyDataReturn {
  dailyData: SDRDailyData[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  getDataByDate: (funnelId: string, date: string) => Promise<SDRDailyData | null>;
  getDataByPeriod: (
    funnelId: string,
    startDate: string,
    endDate: string
  ) => Promise<SDRDailyData[]>;
  insertData: (data: SDRDailyDataInput) => Promise<SDRDailyData | null>;
  updateData: (id: string, data: Partial<SDRDailyDataInput>) => Promise<boolean>;
  deleteData: (id: string) => Promise<boolean>;

  // Aggregation
  getAggregatedData: (funnelId: string, period: PeriodData) => Promise<AggregatedSDRData>;

  // Utility
  refreshData: () => Promise<void>;
}

export function useSDRDailyData(funnelId?: string | null): UseSDRDailyDataReturn {
  const { organization, user } = useOrganization();
  const { toast } = useToast();

  const [dailyData, setDailyData] = useState<SDRDailyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch daily data for a funnel
  const fetchData = useCallback(async () => {
    if (!organization || !funnelId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sdr_data')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('funnel_id', funnelId)
        .order('data_date', { ascending: false });

      if (fetchError) throw fetchError;

      setDailyData(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Error fetching SDR daily data:', err);
    } finally {
      setLoading(false);
    }
  }, [organization, funnelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get data by specific date
  const getDataByDate = async (
    funnelId: string,
    date: string
  ): Promise<SDRDailyData | null> => {
    if (!organization) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('sdr_data')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('funnel_id', funnelId)
        .eq('data_date', date)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') return null; // No rows found
        throw fetchError;
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching SDR data by date:', err);
      return null;
    }
  };

  // Get data by period
  const getDataByPeriod = async (
    funnelId: string,
    startDate: string,
    endDate: string
  ): Promise<SDRDailyData[]> => {
    if (!organization) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('sdr_data')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('funnel_id', funnelId)
        .gte('data_date', startDate)
        .lte('data_date', endDate)
        .order('data_date', { ascending: true });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching SDR data by period:', err);
      return [];
    }
  };

  // Insert new data
  const insertData = async (input: SDRDailyDataInput): Promise<SDRDailyData | null> => {
    if (!organization || !user) {
      toast({
        title: 'Erro',
        description: 'Organização ou usuário não encontrado',
        variant: 'destructive',
      });
      return null;
    }

    // Validate
    const validation = validateSDRDailyData(input as any);
    if (!validation.valid) {
      toast({
        title: 'Dados inválidos',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return null;
    }

    try {
      setLoading(true);

      const { data, error: insertError } = await supabase
        .from('sdr_data')
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          ...input,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Dados salvos',
        description: 'Dados do SDR inseridos com sucesso',
      });

      await fetchData();
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao inserir dados';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing data
  const updateData = async (
    id: string,
    updates: Partial<SDRDailyDataInput>
  ): Promise<boolean> => {
    if (!organization) return false;

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('sdr_data')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: 'Dados atualizados',
        description: 'Dados do SDR atualizados com sucesso',
      });

      await fetchData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar dados';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete data
  const deleteData = async (id: string): Promise<boolean> => {
    if (!organization) return false;

    try {
      setLoading(true);

      const { error: deleteError } = await supabase
        .from('sdr_data')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Dados removidos',
        description: 'Dados do SDR removidos com sucesso',
      });

      await fetchData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover dados';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get aggregated data for a period
  const getAggregatedData = async (
    funnelId: string,
    period: PeriodData
  ): Promise<AggregatedSDRData> => {
    const startDate = formatDateForDB(period.startDate);
    const endDate = formatDateForDB(period.endDate);

    const periodData = await getDataByPeriod(funnelId, startDate, endDate);
    return aggregateSDRData(periodData, period);
  };

  return {
    dailyData,
    loading,
    error,
    getDataByDate,
    getDataByPeriod,
    insertData,
    updateData,
    deleteData,
    getAggregatedData,
    refreshData: fetchData,
  };
}
