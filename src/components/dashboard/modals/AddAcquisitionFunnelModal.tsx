import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { useAcquisitionFunnels } from '@/hooks/useAcquisitionFunnels';
import type { AcquisitionFunnelInput } from '@/types/funnel';

interface AddAcquisitionFunnelModalProps {
  trigger?: React.ReactNode;
}

export function AddAcquisitionFunnelModal({ trigger }: AddAcquisitionFunnelModalProps) {
  const { createFunnel } = useAcquisitionFunnels();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<AcquisitionFunnelInput>({
    name: '',
    description: '',
    monthly_investment: 0,
    is_active: true,
  });

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
        monthly_investment: 0,
        is_active: true,
      });
    }

    setLoading(false);
  };

  const handleChange = (field: keyof AcquisitionFunnelInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <DialogTitle>Novo Funil de Aquisição</DialogTitle>
          <DialogDescription>
            Crie um novo funil para acompanhar suas métricas de aquisição de leads.
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
                placeholder="Ex: Campanha Facebook Q1"
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

            <div className="grid gap-2">
              <Label htmlFor="investment">Investimento Mensal (R$)</Label>
              <Input
                id="investment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monthly_investment || ''}
                onChange={(e) => handleChange('monthly_investment', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Valor padrão de investimento mensal para este funil
              </p>
            </div>
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
