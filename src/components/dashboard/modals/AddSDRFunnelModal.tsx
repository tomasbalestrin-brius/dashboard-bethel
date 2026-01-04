import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSDRFunnels } from '@/hooks/useSDRFunnels';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import type { SDRFunnelInput } from '@/types/funnel';

interface AddSDRFunnelModalProps {
  trigger?: React.ReactNode;
}

interface OrgUser {
  id: string;
  email: string;
  full_name?: string;
}

export function AddSDRFunnelModal({ trigger }: AddSDRFunnelModalProps) {
  const { user } = useAuth();
  const { createFunnel } = useSDRFunnels();
  const { organization, userRole } = useOrganization();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);

  const [formData, setFormData] = useState<SDRFunnelInput>({
    name: '',
    description: '',
    owner_id: user?.id,
    is_active: true,
  });

  // Fetch organization users (for owner selection)
  useEffect(() => {
    const fetchOrgUsers = async () => {
      if (!organization) return;

      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            user_id,
            profiles:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('organization_id', organization.id)
          .in('role', ['owner', 'admin', 'gestor', 'sdr']);

        if (error) throw error;

        const users: OrgUser[] = (data || []).map((item: any) => ({
          id: item.profiles.id,
          email: item.profiles.email,
          full_name: item.profiles.full_name,
        }));

        setOrgUsers(users);
      } catch (error) {
        console.error('Error fetching org users:', error);
      }
    };

    if (open && organization) {
      fetchOrgUsers();
    }
  }, [open, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createFunnel(formData);

    if (result.success) {
      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        owner_id: user?.id,
        is_active: true,
      });
    }

    setLoading(false);
  };

  const handleChange = (field: keyof SDRFunnelInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Admins e Gestores podem selecionar proprietário, SDRs são sempre donos dos próprios funis
  const canSelectOwner = userRole === 'owner' || userRole === 'admin' || userRole === 'gestor';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Funil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Funil SDR</DialogTitle>
          <DialogDescription>
            Crie um novo funil para acompanhar métricas de qualificação e conversão de leads.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome do Funil <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Pipeline Infoprodutos"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional do funil..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {canSelectOwner && (
              <div className="grid gap-2">
                <Label htmlFor="owner">
                  Proprietário do Funil <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => handleChange('owner_id', value)}
                >
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Selecione o proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgUsers.map((orgUser) => (
                      <SelectItem key={orgUser.id} value={orgUser.id}>
                        {orgUser.full_name || orgUser.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Quem será responsável por gerenciar este funil
                </p>
              </div>
            )}

            {!canSelectOwner && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Você será o proprietário deste funil.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Criando...' : 'Criar Funil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
