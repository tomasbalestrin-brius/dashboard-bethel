import { useState, useEffect, useCallback } from 'react';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import type {
  AcquisitionFunnel,
  AcquisitionFunnelData,
  AcquisitionFunnelInput,
  AcquisitionFunnelDataInput,
  MonthCode,
} from '@/types/funnel';

export const useAcquisitionFunnels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { organization } = useOrganization();

  const [funnels, setFunnels] = useState<AcquisitionFunnel[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<AcquisitionFunnel | null>(null);
  const [funnelData, setFunnelData] = useState<AcquisitionFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch all funnels for the current organization
  const fetchFunnels = useCallback(async () => {
    if (!organization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('acquisition_funnels')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFunnels((data as AcquisitionFunnel[]) || []);

      // Set first funnel as current if none selected
      if (!currentFunnel && data && data.length > 0) {
        setCurrentFunnel(data[0] as AcquisitionFunnel);
      }
    } catch (error: any) {
      console.error('Error fetching acquisition funnels:', error);
      toast({
        title: 'Erro ao carregar funis',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organization, currentFunnel, toast]);

  // Fetch data for a specific funnel
  const fetchFunnelData = useCallback(async (funnelId: string, month?: MonthCode, year?: number) => {
    try {
      setLoadingData(true);
      let query = supabase
        .from('acquisition_funnel_data')
        .select('*')
        .eq('funnel_id', funnelId);

      if (month) {
        query = query.eq('month', month);
      }

      if (year) {
        query = query.eq('year', year);
      }

      query = query.order('year', { ascending: false }).order('month', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setFunnelData((data as AcquisitionFunnelData[]) || []);
    } catch (error: any) {
      console.error('Error fetching funnel data:', error);
      toast({
        title: 'Erro ao carregar dados do funil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  // Create a new funnel
  const createFunnel = async (input: AcquisitionFunnelInput) => {
    if (!organization || !user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('acquisition_funnels')
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Funil criado!',
        description: `O funil "${input.name}" foi criado com sucesso.`,
      });

      // Refresh funnels list
      await fetchFunnels();

      return { success: true, data: data as AcquisitionFunnel };
    } catch (error: any) {
      console.error('Error creating funnel:', error);
      toast({
        title: 'Erro ao criar funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Update a funnel
  const updateFunnel = async (funnelId: string, updates: Partial<AcquisitionFunnelInput>) => {
    try {
      const { data, error } = await supabase
        .from('acquisition_funnels')
        .update(updates)
        .eq('id', funnelId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Funil atualizado!',
      });

      // Refresh funnels list
      await fetchFunnels();

      return { success: true, data: data as AcquisitionFunnel };
    } catch (error: any) {
      console.error('Error updating funnel:', error);
      toast({
        title: 'Erro ao atualizar funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Delete a funnel (soft delete by setting is_active to false)
  const deleteFunnel = async (funnelId: string) => {
    try {
      const { error } = await supabase
        .from('acquisition_funnels')
        .update({ is_active: false })
        .eq('id', funnelId);

      if (error) throw error;

      toast({
        title: 'Funil removido!',
      });

      // Refresh funnels list
      await fetchFunnels();

      // Clear current funnel if it was deleted
      if (currentFunnel?.id === funnelId) {
        setCurrentFunnel(null);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting funnel:', error);
      toast({
        title: 'Erro ao remover funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Upsert funnel data (create or update)
  const upsertFunnelData = async (input: AcquisitionFunnelDataInput) => {
    try {
      const { data, error } = await supabase
        .from('acquisition_funnel_data')
        .upsert(input, {
          onConflict: 'funnel_id,month,year',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Dados salvos!',
        description: 'Os dados do funil foram atualizados.',
      });

      // Refresh funnel data
      if (currentFunnel) {
        await fetchFunnelData(currentFunnel.id);
      }

      return { success: true, data: data as AcquisitionFunnelData };
    } catch (error: any) {
      console.error('Error saving funnel data:', error);
      toast({
        title: 'Erro ao salvar dados',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Calculate cost per lead for current funnel
  const calculateCostPerLead = (data: AcquisitionFunnelData): number => {
    if (data.total_leads === 0) return 0;
    return Number((data.investment / data.total_leads).toFixed(2));
  };

  // Calculate overall metrics for all funnels
  const calculateOverallMetrics = () => {
    if (funnelData.length === 0) {
      return {
        total_leads: 0,
        total_investment: 0,
        total_sales: 0,
        avg_cost_per_lead: 0,
        avg_conversion_rate: 0,
      };
    }

    const totals = funnelData.reduce(
      (acc, data) => ({
        total_leads: acc.total_leads + data.total_leads,
        total_investment: acc.total_investment + data.investment,
        total_sales: acc.total_sales + data.sales,
      }),
      { total_leads: 0, total_investment: 0, total_sales: 0 }
    );

    const avg_cost_per_lead = totals.total_leads > 0
      ? totals.total_investment / totals.total_leads
      : 0;

    const avg_conversion_rate = funnelData.length > 0
      ? funnelData.reduce((sum, data) => sum + data.conversion_rate, 0) / funnelData.length
      : 0;

    return {
      ...totals,
      avg_cost_per_lead: Number(avg_cost_per_lead.toFixed(2)),
      avg_conversion_rate: Number(avg_conversion_rate.toFixed(2)),
    };
  };

  // Load funnels on mount
  useEffect(() => {
    if (organization) {
      fetchFunnels();
    }
  }, [organization, fetchFunnels]);

  // Load data when current funnel changes
  useEffect(() => {
    if (currentFunnel) {
      fetchFunnelData(currentFunnel.id);
    }
  }, [currentFunnel, fetchFunnelData]);

  return {
    funnels,
    currentFunnel,
    setCurrentFunnel,
    funnelData,
    loading,
    loadingData,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    upsertFunnelData,
    fetchFunnelData,
    calculateCostPerLead,
    calculateOverallMetrics,
    refresh: fetchFunnels,
  };
};
