import { useState, useEffect, useCallback } from 'react';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import type { SDRFunnel, SDRFunnelInput } from '@/types/funnel';

export const useSDRFunnels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { organization, userRole } = useOrganization();

  const [funnels, setFunnels] = useState<SDRFunnel[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<SDRFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all funnels (admins see all, SDRs see only their own)
  const fetchFunnels = useCallback(async () => {
    if (!organization || !user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('sdr_funnels')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true);

      // Se for SDR, mostrar apenas funis do próprio usuário
      if (userRole === 'sdr') {
        query = query.eq('owner_id', user.id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setFunnels((data as SDRFunnel[]) || []);

      // Set first funnel as current if none selected
      if (!currentFunnel && data && data.length > 0) {
        setCurrentFunnel(data[0] as SDRFunnel);
      }
    } catch (error: any) {
      console.error('Error fetching SDR funnels:', error);
      toast({
        title: 'Erro ao carregar funis SDR',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organization, user, userRole, currentFunnel, toast]);

  // Create a new SDR funnel
  const createFunnel = async (input: SDRFunnelInput) => {
    if (!organization || !user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('sdr_funnels')
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          // Se não especificar owner, o owner é o próprio usuário
          owner_id: input.owner_id || user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Funil SDR criado!',
        description: `O funil "${input.name}" foi criado com sucesso.`,
      });

      // Refresh funnels list
      await fetchFunnels();

      return { success: true, data: data as SDRFunnel };
    } catch (error: any) {
      console.error('Error creating SDR funnel:', error);
      toast({
        title: 'Erro ao criar funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Update a funnel
  const updateFunnel = async (funnelId: string, updates: Partial<SDRFunnelInput>) => {
    try {
      const { data, error } = await supabase
        .from('sdr_funnels')
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

      return { success: true, data: data as SDRFunnel };
    } catch (error: any) {
      console.error('Error updating SDR funnel:', error);
      toast({
        title: 'Erro ao atualizar funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Delete a funnel (soft delete)
  const deleteFunnel = async (funnelId: string) => {
    try {
      const { error } = await supabase
        .from('sdr_funnels')
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
      console.error('Error deleting SDR funnel:', error);
      toast({
        title: 'Erro ao remover funil',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Check if user can edit a specific funnel
  const canEditFunnel = (funnel: SDRFunnel): boolean => {
    if (!user) return false;

    // Admins e Gestores podem editar qualquer funil
    if (userRole === 'owner' || userRole === 'admin' || userRole === 'gestor') {
      return true;
    }

    // SDRs podem editar apenas seus próprios funis
    if (userRole === 'sdr' && funnel.owner_id === user.id) {
      return true;
    }

    return false;
  };

  // Load funnels on mount
  useEffect(() => {
    if (organization && user) {
      fetchFunnels();
    }
  }, [organization, user, fetchFunnels]);

  return {
    funnels,
    currentFunnel,
    setCurrentFunnel,
    loading,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    canEditFunnel,
    refresh: fetchFunnels,
  };
};
