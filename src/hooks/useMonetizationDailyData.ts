import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';
import type {
  MonetizationDailyData,
  MonetizationDailyDataInput,
  AggregatedMonetizationData,
  PeriodData,
} from '@/types/dailyData';
import { formatDateForDB } from '@/types/dailyData';
import {
  aggregateMonetizationData,
  validateMonetizationDailyData,
} from '@/utils/metricsCalculations';

interface UseMonetizationDailyDataReturn {
  dailyData: MonetizationDailyData[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  getDataByDate: (date: string) => Promise<MonetizationDailyData | null>;
  getDataByPeriod: (startDate: string, endDate: string) => Promise<MonetizationDailyData[]>;
  insertData: (data: MonetizationDailyDataInput) => Promise<MonetizationDailyData | null>;
  updateData: (id: string, data: Partial<MonetizationDailyDataInput>) => Promise<boolean>;
  deleteData: (id: string) => Promise<boolean>;

  // Aggregation
  getAggregatedData: (period: PeriodData) => Promise<AggregatedMonetizationData>;

  // Utility
  refreshData: () => Promise<void>;
}

export function useMonetizationDailyData(): UseMonetizationDailyDataReturn {
  const { organization, user } = useOrganization();
  const { toast } = useToast();

  const [dailyData, setDailyData] = useState<MonetizationDailyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all daily data for organization
  const fetchData = useCallback(async () => {
    if (!organization) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('monetization_data')
        .select('*')
        .eq('organization_id', organization.id)
        .order('data_date', { ascending: false });

      if (fetchError) throw fetchError;

      setDailyData(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Error fetching Monetization daily data:', err);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get data by specific date
  const getDataByDate = useCallback(async (date: string): Promise<MonetizationDailyData | null> => {
    if (!organization) {
      console.log('No organization available for getDataByDate');
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('monetization_data')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('data_date', date)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching data by date:', fetchError);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching Monetization data by date:', err);
      return null;
    }
  }, [organization]);

  // Get data by period
  const getDataByPeriod = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<MonetizationDailyData[]> => {
    if (!organization) {
      console.log('No organization available for getDataByPeriod');
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('monetization_data')
        .select('*')
        .eq('organization_id', organization.id)
        .gte('data_date', startDate)
        .lte('data_date', endDate)
        .order('data_date', { ascending: true });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching Monetization data by period:', err);
      toast({
        title: 'Erro ao carregar dados',
        description: err.message,
        variant: 'destructive',
      });
      return [];
    }
  }, [organization, toast]);

  // Insert new data
  const insertData = async (
    input: MonetizationDailyDataInput
  ): Promise<MonetizationDailyData | null> => {
    if (!organization || !user) {
      toast({
        title: 'Erro',
        description: 'Organização ou usuário não encontrado',
        variant: 'destructive',
      });
      return null;
    }

    // Validate
    const validation = validateMonetizationDailyData(input as any);
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
        .from('monetization_data')
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
        description: 'Dados de monetização inseridos com sucesso',
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
    updates: Partial<MonetizationDailyDataInput>
  ): Promise<boolean> => {
    if (!organization) return false;

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('monetization_data')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: 'Dados atualizados',
        description: 'Dados de monetização atualizados com sucesso',
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
        .from('monetization_data')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Dados removidos',
        description: 'Dados de monetização removidos com sucesso',
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
  const getAggregatedData = async (period: PeriodData): Promise<AggregatedMonetizationData> => {
    const startDate = formatDateForDB(period.startDate);
    const endDate = formatDateForDB(period.endDate);

    const periodData = await getDataByPeriod(startDate, endDate);
    return aggregateMonetizationData(periodData, period);
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
