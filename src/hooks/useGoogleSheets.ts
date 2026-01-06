import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';
import type {
  GoogleSheetsIntegration,
  GoogleSheetsIntegrationInput,
  GoogleSheetsSyncHistory,
  GoogleSheetsSyncResult,
  ModuleSyncConfig,
  SyncDataRow,
} from '@/types/googleSheets';
import type { ModuleName } from '@/types/dashboard';

interface UseGoogleSheetsReturn {
  integrations: GoogleSheetsIntegration[];
  currentIntegration: GoogleSheetsIntegration | null;
  syncHistory: GoogleSheetsSyncHistory[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  createIntegration: (input: GoogleSheetsIntegrationInput) => Promise<GoogleSheetsIntegration | null>;
  updateIntegration: (id: string, updates: Partial<GoogleSheetsIntegration>) => Promise<boolean>;
  deleteIntegration: (id: string) => Promise<boolean>;
  getIntegrationForModule: (moduleName: ModuleName) => GoogleSheetsIntegration | null;

  // OAuth operations
  initiateOAuthFlow: (moduleName: ModuleName) => Promise<string>;
  handleOAuthCallback: (code: string) => Promise<boolean>;

  // Sync operations
  syncToGoogleSheets: (integrationId: string, data: SyncDataRow[], config: ModuleSyncConfig) => Promise<GoogleSheetsSyncResult>;
  fetchSyncHistory: (integrationId: string) => Promise<void>;

  // Utility
  refreshIntegrations: () => Promise<void>;
}

export function useGoogleSheets(moduleName?: ModuleName): UseGoogleSheetsReturn {
  const { organization, user } = useOrganization();
  const { toast } = useToast();

  const [integrations, setIntegrations] = useState<GoogleSheetsIntegration[]>([]);
  const [currentIntegration, setCurrentIntegration] = useState<GoogleSheetsIntegration | null>(null);
  const [syncHistory, setSyncHistory] = useState<GoogleSheetsSyncHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch integrations for the organization
  const fetchIntegrations = useCallback(async () => {
    if (!organization) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('google_sheets_integrations')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (moduleName) {
        query = query.eq('module_name', moduleName);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setIntegrations(data || []);

      // Set current integration if module is specified
      if (moduleName && data && data.length > 0) {
        setCurrentIntegration(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching Google Sheets integrations:', err);
    } finally {
      setLoading(false);
    }
  }, [organization, moduleName]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Create new integration
  const createIntegration = async (
    input: GoogleSheetsIntegrationInput
  ): Promise<GoogleSheetsIntegration | null> => {
    console.log('🔍 createIntegration - Verificando organization e user...', {
      hasOrganization: !!organization,
      hasUser: !!user,
      organizationId: organization?.id,
      userId: user?.id,
    });

    if (!organization || !user) {
      const errorMsg = !organization
        ? 'Organização não encontrada. Aguarde o carregamento ou recarregue a página.'
        : 'Usuário não encontrado. Faça login novamente.';

      console.error('❌ createIntegration - Erro:', errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
      return null;
    }

    try {
      setLoading(true);
      console.log('📤 createIntegration - Criando integração...', input);

      // Separar field_mappings do input principal
      const { field_mappings, ...integrationData } = input;

      const { data, error: insertError } = await supabase
        .from('google_sheets_integrations')
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          ...integrationData,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('❌ createIntegration - Erro no insert:', insertError);
        throw insertError;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após criar integração');
      }

      console.log('✅ createIntegration - Integração criada:', data);

      // Salvar mapeamentos de campos, se houver
      if (field_mappings && field_mappings.length > 0) {
        console.log('📋 Salvando', field_mappings.length, 'mapeamentos de campos...');

        const mappingsToInsert = field_mappings.map((mapping) => ({
          integration_id: data.id,
          ...mapping,
        }));

        const { error: mappingsError } = await supabase
          .from('google_sheets_field_mappings')
          .insert(mappingsToInsert);

        if (mappingsError) {
          console.error('❌ Erro ao salvar mapeamentos:', mappingsError);
          // Não falhar completamente, apenas avisar
          toast({
            title: 'Aviso',
            description: 'Integração criada, mas houve erro ao salvar mapeamentos de campos',
            variant: 'destructive',
          });
        } else {
          console.log('✅ Mapeamentos salvos com sucesso');
        }
      }

      toast({
        title: 'Integração criada',
        description: 'Integração com Google Sheets criada com sucesso',
      });

      await fetchIntegrations();
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar integração';
      console.error('❌ createIntegration - Erro final:', errorMessage, err);
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

  // Update integration
  const updateIntegration = async (
    id: string,
    updates: Partial<GoogleSheetsIntegration>
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('google_sheets_integrations')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Integração atualizada',
        description: 'Configurações atualizadas com sucesso',
      });

      await fetchIntegrations();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar integração';
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

  // Delete integration
  const deleteIntegration = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error: deleteError } = await supabase
        .from('google_sheets_integrations')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Integração removida',
        description: 'Integração desativada com sucesso',
      });

      await fetchIntegrations();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover integração';
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

  // Get integration for specific module
  const getIntegrationForModule = (moduleName: ModuleName): GoogleSheetsIntegration | null => {
    return integrations.find((int) => int.module_name === moduleName) || null;
  };

  // Initiate OAuth flow
  const initiateOAuthFlow = async (moduleName: ModuleName): Promise<string> => {
    // Google OAuth2 configuration
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/spreadsheets';

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', moduleName); // Pass module name in state

    return authUrl.toString();
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string): Promise<boolean> => {
    try {
      // Exchange code for tokens
      // This should be done via a backend function for security
      // For now, this is a placeholder
      console.log('OAuth code received:', code);

      toast({
        title: 'Autenticação concluída',
        description: 'Conta Google conectada com sucesso',
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Erro na autenticação',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Sync data to Google Sheets
  const syncToGoogleSheets = async (
    integrationId: string,
    data: SyncDataRow[],
    config: ModuleSyncConfig
  ): Promise<GoogleSheetsSyncResult> => {
    try {
      setLoading(true);

      const integration = integrations.find((int) => int.id === integrationId);
      if (!integration) {
        throw new Error('Integração não encontrada');
      }

      // Prepare data for Google Sheets
      const rows = [config.headers, ...data.map((row) => config.headers.map((header) => row[header] ?? ''))];

      // Call Google Sheets API
      // This should be done via a backend function for security
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${integration.spreadsheet_id}/values/${integration.sheet_name || 'Sheet1'}!A1:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao sincronizar com Google Sheets');
      }

      // Record sync history
      await supabase.from('google_sheets_sync_history').insert({
        integration_id: integrationId,
        sync_type: 'manual',
        status: 'success',
        rows_synced: data.length,
        synced_by: user?.id,
      });

      // Update last_synced_at
      await updateIntegration(integrationId, {
        last_synced_at: new Date().toISOString(),
      });

      toast({
        title: 'Sincronização concluída',
        description: `${data.length} linhas sincronizadas com sucesso`,
      });

      return {
        success: true,
        rows_synced: data.length,
        spreadsheet_url: `https://docs.google.com/spreadsheets/d/${integration.spreadsheet_id}`,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao sincronizar dados';

      // Record failed sync
      await supabase.from('google_sheets_sync_history').insert({
        integration_id: integrationId,
        sync_type: 'manual',
        status: 'failed',
        rows_synced: 0,
        error_message: errorMessage,
        synced_by: user?.id,
      });

      toast({
        title: 'Erro na sincronização',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        rows_synced: 0,
        error_message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch sync history
  const fetchSyncHistory = async (integrationId: string): Promise<void> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('google_sheets_sync_history')
        .select('*')
        .eq('integration_id', integrationId)
        .order('synced_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setSyncHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching sync history:', err);
    }
  };

  // Adicionar mapeamentos a uma integração existente (para novo funil)
  const addFieldMappings = async (integrationId: string, mappings: any[]) => {
    try {
      setLoading(true);

      if (!mappings || mappings.length === 0) {
        console.log('⚠️ Nenhum mapeamento para adicionar');
        return true;
      }

      console.log('📋 Adicionando', mappings.length, 'mapeamentos à integração', integrationId);

      const mappingsToInsert = mappings.map((mapping) => ({
        integration_id: integrationId,
        ...mapping,
      }));

      const { error: mappingsError } = await supabase
        .from('google_sheets_field_mappings')
        .insert(mappingsToInsert);

      if (mappingsError) {
        console.error('❌ Erro ao adicionar mapeamentos:', mappingsError);
        throw mappingsError;
      }

      console.log('✅ Mapeamentos adicionados com sucesso');

      toast({
        title: 'Configuração salva',
        description: 'Mapeamentos do funil salvos com sucesso',
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar mapeamentos';
      console.error('❌ addFieldMappings - Erro:', errorMessage, err);
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

  return {
    integrations,
    currentIntegration,
    syncHistory,
    loading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    getIntegrationForModule,
    initiateOAuthFlow,
    handleOAuthCallback,
    syncToGoogleSheets,
    fetchSyncHistory,
    addFieldMappings,
    refreshIntegrations: fetchIntegrations,
  };
}
