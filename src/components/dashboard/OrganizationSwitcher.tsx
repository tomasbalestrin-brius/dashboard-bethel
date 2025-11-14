import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface OrgWithRole {
  id: string;
  name: string;
  logo_url: string | null;
  role: string;
}

export function OrganizationSwitcher() {
  const { organization, switchOrganization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userOrgs, setUserOrgs] = useState<OrgWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrganizations();
    }
  }, [user]);

  const fetchUserOrganizations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const orgs = data?.map((item: any) => ({
        id: item.organizations.id,
        name: item.organizations.name,
        logo_url: item.organizations.logo_url,
        role: item.role,
      })) || [];

      setUserOrgs(orgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleSwitch = async (orgId: string) => {
    if (orgId === organization?.id) return;

    setLoading(true);
    await switchOrganization(orgId);
    setLoading(false);
    window.location.reload(); // Reload para aplicar novos dados
  };

  const handleCreateOrg = async () => {
    if (!user || !newOrgName.trim()) return;

    setCreating(true);
    try {
      // Gerar slug único
      const slug = newOrgName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50) + '-' + Date.now().toString(36);

      // Criar organização
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Adicionar usuário como owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({
        title: 'Organização criada!',
        description: `${newOrgName} foi criada com sucesso`,
      });

      // Trocar para nova org
      await handleSwitch(newOrg.id);
      
      setCreateDialogOpen(false);
      setNewOrgName('');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Erro ao criar organização',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Não mostrar se usuário tiver apenas 1 org
  if (userOrgs.length <= 1) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-border"
            disabled={loading}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden md:inline">{organization?.name || 'Organização'}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-muted-foreground">
            Suas Organizações
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {userOrgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {org.logo_url ? (
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {org.name[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{org.name}</span>
                  {org.id === organization?.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {org.role}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Criar nova organização</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Organização</DialogTitle>
            <DialogDescription>
              Crie uma nova organização para gerenciar seus dados separadamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nome da Organização</Label>
              <Input
                id="org-name"
                placeholder="Ex: Minha Empresa"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateOrg();
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={!newOrgName.trim() || creating}
            >
              {creating ? 'Criando...' : 'Criar Organização'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
