import { useState, useEffect } from 'react';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserRole, ModuleType } from '@/types/auth';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  favicon_url: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  max_users: number;
  max_spreadsheets: number;
  features: Record<string, any>;
  status: 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  role: UserRole;
  joined_at: string;
  user_id: string;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrganization();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrganization = async () => {
    if (!user) return;

    try {
      // Buscar organização atual do profile
      const { data: profile, error: profileError} = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.current_organization_id) {
        setLoading(false);
        return;
      }

      // Buscar dados da organização
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.current_organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(org as Organization);

      // Buscar role do usuário
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', profile.current_organization_id)
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      setUserRole((membership?.role as UserRole) || null);

      // Buscar membros (se admin)
      if (membership?.role && ['owner', 'admin'].includes(membership.role)) {
        await fetchMembers(profile.current_organization_id);
      }
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      toast({
        title: 'Erro ao carregar organização',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          user_id
        `)
        .eq('organization_id', orgId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers((data as OrganizationMember[]) || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return { success: false };

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;
      setOrganization(data as Organization);
      
      toast({
        title: 'Organização atualizada!',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Erro ao atualizar organização',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const switchOrganization = async (orgId: string) => {
    if (!user) return { success: false };

    try {
      // Verificar se o usuário é membro da organização
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        throw new Error('Você não tem acesso a esta organização');
      }

      // Atualizar profile com nova org
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_organization_id: orgId })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Recarregar dados
      await fetchOrganization();
      
      toast({
        title: 'Organização alterada!',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error switching organization:', error);
      toast({
        title: 'Erro ao trocar organização',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const checkUserLimit = async () => {
    if (!organization) return false;

    try {
      const { data, error } = await supabase.rpc('check_user_limit', {
        _org_id: organization.id
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking user limit:', error);
      return false;
    }
  };

  const inviteMember = async (email: string, role: Exclude<UserRole, 'owner'>) => {
    if (!organization || !user) return { success: false };

    try {
      // Verificar limite
      const canInvite = await checkUserLimit();
      if (!canInvite) {
        toast({
          title: 'Limite de usuários atingido',
          description: 'Faça upgrade do plano para adicionar mais membros',
          variant: 'destructive',
        });
        return { success: false };
      }

      // Criar convite
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: organization.id,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Convite enviado!',
        description: `Um email foi enviado para ${email}`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Erro ao enviar convite',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!organization) return { success: false };

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers(organization.id);
      
      toast({
        title: 'Membro removido!',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateMemberRole = async (memberId: string, newRole: Exclude<UserRole, 'owner'>) => {
    if (!organization) return { success: false };

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers(organization.id);
      
      toast({
        title: 'Role atualizada!',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Erro ao atualizar role',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Funções auxiliares de permissão
  const isOwner = userRole === 'owner';
  const isAdmin = userRole ? ['owner', 'admin'].includes(userRole) : false;
  const isGestor = userRole === 'gestor';
  const isSDR = userRole === 'sdr';
  const isComercial = userRole === 'comercial';
  const canManageMembers = isAdmin;
  const canManageSettings = isAdmin;

  // Verificar se usuário pode acessar um módulo específico
  const canAccessModule = async (moduleName: ModuleType): Promise<boolean> => {
    if (!user || !organization) return false;

    try {
      const { data, error } = await supabase.rpc('user_can_access_module', {
        _user_id: user.id,
        _org_id: organization.id,
        _module_name: moduleName
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  };

  // Verificar se usuário pode editar um módulo específico
  const canEditModule = async (moduleName: ModuleType): Promise<boolean> => {
    if (!user || !organization) return false;

    try {
      const { data, error } = await supabase.rpc('user_can_edit_module', {
        _user_id: user.id,
        _org_id: organization.id,
        _module_name: moduleName
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking module edit permission:', error);
      return false;
    }
  };

  // Verificação rápida de permissões baseada apenas no role (sem chamada ao banco)
  const hasQuickAccess = (moduleName: ModuleType): boolean => {
    if (!userRole) return false;

    // Owner e Admin têm acesso a tudo
    if (isOwner || isAdmin) return true;

    // Mapeamento de permissões por role
    const rolePermissions: Record<UserRole, ModuleType[]> = {
      owner: ['dashboard', 'resumo', 'aquisicao', 'sdr', 'monetizacao', 'settings'],
      admin: ['dashboard', 'resumo', 'aquisicao', 'sdr', 'monetizacao', 'settings'],
      gestor: ['dashboard', 'resumo', 'sdr', 'monetizacao'],
      sdr: ['sdr', 'resumo'],
      comercial: ['monetizacao', 'resumo'],
      member: ['dashboard', 'resumo', 'aquisicao'],
      viewer: ['dashboard', 'resumo'],
    };

    return rolePermissions[userRole]?.includes(moduleName) || false;
  };

  return {
    organization,
    members,
    userRole,
    loading,
    isOwner,
    isAdmin,
    isGestor,
    isSDR,
    isComercial,
    canManageMembers,
    canManageSettings,
    canAccessModule,
    canEditModule,
    hasQuickAccess,
    updateOrganization,
    switchOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    refresh: fetchOrganization,
  };
};
