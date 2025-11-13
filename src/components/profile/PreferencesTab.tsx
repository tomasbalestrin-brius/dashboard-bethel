import { useState, useEffect } from 'react';
import { Settings, Bell, Globe, DollarSign } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/auth/LoadingButton';
import { ProfileCard } from './ProfileCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Preferences {
  emailNotifications: boolean;
  weeklyTips: boolean;
  anomalyAlerts: boolean;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export function PreferencesTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    weeklyTips: true,
    anomalyAlerts: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.preferences) {
        setPreferences(user.user_metadata.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { preferences }
      });

      if (error) throw error;

      // Salvar também no localStorage para aplicação imediata
      localStorage.setItem('preferences', JSON.stringify(preferences));

      toast({
        title: 'Preferências salvas!',
        description: 'Suas preferências foram atualizadas',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar preferências',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <ProfileCard
        title="Notificações por Email"
        description="Gerencie suas preferências de comunicação"
        icon={<Bell className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
            <div>
              <p className="font-semibold text-foreground">Atualizações de produtos</p>
              <p className="text-sm text-muted-foreground">
                Receba atualizações sobre produtos acompanhados
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
            <div>
              <p className="font-semibold text-foreground">Dicas semanais</p>
              <p className="text-sm text-muted-foreground">
                Receba dicas e insights semanalmente
              </p>
            </div>
            <Switch
              checked={preferences.weeklyTips}
              onCheckedChange={(checked) => updatePreference('weeklyTips', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
            <div>
              <p className="font-semibold text-foreground">Alertas de anomalias</p>
              <p className="text-sm text-muted-foreground">
                Notificações sobre mudanças significativas
              </p>
            </div>
            <Switch
              checked={preferences.anomalyAlerts}
              onCheckedChange={(checked) => updatePreference('anomalyAlerts', checked)}
            />
          </div>
        </div>
      </ProfileCard>

      <ProfileCard
        title="Regionalização"
        description="Configure formatos e idioma"
        icon={<Globe className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Fuso Horário
            </label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => updatePreference('timezone', value)}
            >
              <SelectTrigger className="h-11 bg-slate-900/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                <SelectItem value="America/New_York">Nova York (EST)</SelectItem>
                <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tóquio (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Formato de Data
            </label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) => updatePreference('dateFormat', value)}
            >
              <SelectTrigger className="h-11 bg-slate-900/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Hoje: {new Date().toLocaleDateString('pt-BR')})</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Today: {new Date().toLocaleDateString('en-US')})</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (Today: {new Date().toISOString().split('T')[0]})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard
        title="Moeda Padrão"
        description="Configure a moeda de exibição"
        icon={<DollarSign className="w-5 h-5" />}
      >
        <div className="space-y-2">
          <Select
            value={preferences.currency}
            onValueChange={(value) => updatePreference('currency', value)}
          >
            <SelectTrigger className="h-11 bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
              <SelectItem value="USD">Dólar Americano ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ProfileCard>

      <LoadingButton
        onClick={savePreferences}
        loading={loading}
        className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        Salvar preferências
      </LoadingButton>
    </div>
  );
}
