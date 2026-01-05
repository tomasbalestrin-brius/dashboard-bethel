import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, TrendingUp } from 'lucide-react';
import { useAcquisitionFunnels } from '@/hooks/useAcquisitionFunnels';
import { FunnelSelector, toFunnelOptions } from '@/components/dashboard/FunnelSelector';
import { AddAcquisitionFunnelModal } from '@/components/dashboard/modals/AddAcquisitionFunnelModal';
import { GoogleSheetsButton } from '@/components/dashboard/GoogleSheetsButton';
import type { FunnelViewMode, AcquisitionFunnelDataInput, MonthCode } from '@/types/funnel';
import { MONTHS } from '@/types/funnel';
import { MODULE_SYNC_CONFIGS } from '@/types/googleSheets';

interface AquisicaoModuleProps {
  currentMonth?: string;
  onMonthSelect?: (monthId: string) => void;
}

export function AquisicaoModule({ currentMonth = 'jan', onMonthSelect }: AquisicaoModuleProps) {
  const {
    funnels,
    currentFunnel,
    setCurrentFunnel,
    funnelData,
    loading: loadingFunnels,
    loadingData,
    upsertFunnelData,
    calculateOverallMetrics,
  } = useAcquisitionFunnels();

  const [viewMode, setViewMode] = useState<FunnelViewMode>('individual');
  const [saving, setSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<Partial<AcquisitionFunnelDataInput>>({
    funnel_id: currentFunnel?.id || '',
    month: currentMonth as MonthCode,
    year: new Date().getFullYear(),
    total_leads: 0,
    qualified_leads: 0,
    scheduled: 0,
    calls_done: 0,
    sales: 0,
    investment: 0,
  });

  // Load current month data
  useEffect(() => {
    const currentData = funnelData.find(
      (d) => d.month === currentMonth && d.year === new Date().getFullYear()
    );

    if (currentData) {
      setFormData({
        funnel_id: currentData.funnel_id,
        month: currentData.month,
        year: currentData.year,
        total_leads: currentData.total_leads,
        qualified_leads: currentData.qualified_leads,
        scheduled: currentData.scheduled,
        calls_done: currentData.calls_done,
        sales: currentData.sales,
        investment: currentData.investment,
      });
    } else if (currentFunnel) {
      // Reset form with current funnel and month
      setFormData({
        funnel_id: currentFunnel.id,
        month: currentMonth as MonthCode,
        year: new Date().getFullYear(),
        total_leads: 0,
        qualified_leads: 0,
        scheduled: 0,
        calls_done: 0,
        sales: 0,
        investment: 0,
      });
    }
  }, [funnelData, currentFunnel, currentMonth]);

  const handleSave = async () => {
    if (!currentFunnel) return;

    setSaving(true);
    await upsertFunnelData(formData as AcquisitionFunnelDataInput);
    setSaving(false);
  };

  const handleInputChange = (field: keyof AcquisitionFunnelDataInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Render metrics
  const renderMetrics = () => {
    if (viewMode === 'individual') {
      const currentData = funnelData.find(
        (d) => d.month === currentMonth && d.year === new Date().getFullYear()
      );

      if (!currentData) {
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum dado disponível para este período
            </CardContent>
          </Card>
        );
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Funil</CardTitle>
            <CardDescription>{MONTHS[currentData.month]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{currentData.total_leads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads Qualificados</p>
                <p className="text-2xl font-bold">{currentData.qualified_leads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">{currentData.scheduled}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calls Realizadas</p>
                <p className="text-2xl font-bold">{currentData.calls_done}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-2xl font-bold">{currentData.sales}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investimento</p>
                <p className="text-2xl font-bold">R$ {currentData.investment.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Custo por Lead</p>
                <p className="text-2xl font-semibold text-primary">
                  R$ {currentData.cost_per_lead.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
                <p className="text-2xl font-semibold text-primary">
                  {currentData.conversion_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Overview mode
      const metrics = calculateOverallMetrics();

      return (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Gerais</CardTitle>
            <CardDescription>Todos os funis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{metrics.total_leads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{metrics.total_sales}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investimento Total</p>
                <p className="text-2xl font-bold">R$ {metrics.total_investment.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Custo Médio por Lead</p>
                <p className="text-2xl font-semibold text-primary">
                  R$ {metrics.avg_cost_per_lead.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão Média</p>
                <p className="text-2xl font-semibold text-primary">
                  {metrics.avg_conversion_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🎯 Gestão de Aquisição</h1>
        <p className="text-muted-foreground">
          Gerencie funis de aquisição e acompanhe métricas de marketing
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <FunnelSelector
          funnels={toFunnelOptions(funnels)}
          currentFunnelId={currentFunnel?.id || null}
          viewMode={viewMode}
          onFunnelChange={(id) => {
            const funnel = funnels.find((f) => f.id === id);
            setCurrentFunnel(funnel || null);
          }}
          onViewModeChange={setViewMode}
          loading={loadingFunnels}
        />

        <div className="flex gap-2">
          <GoogleSheetsButton
            moduleName="aquisicao"
            data={funnelData.map((d) => ({
              Data: `${MONTHS[d.month]}/${d.year}`,
              Funil: currentFunnel?.name || '',
              'Total Leads': d.total_leads,
              'Leads Qualificados': d.qualified_leads,
              Agendados: d.scheduled,
              'Calls Realizados': d.calls_done,
              Vendas: d.sales,
              Investimento: d.investment,
              'Custo por Lead': d.cost_per_lead,
            }))}
            syncConfig={MODULE_SYNC_CONFIGS['aquisicao']!}
          />
          <AddAcquisitionFunnelModal />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Input Forms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Entrada de Dados</h2>
            <Button onClick={handleSave} disabled={saving || !currentFunnel} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

          {!currentFunnel ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Selecione um funil para inserir dados
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Dados do Funil</CardTitle>
                <CardDescription>
                  Insira os dados para {MONTHS[formData.month as MonthCode]}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_leads">Total de Leads</Label>
                    <Input
                      id="total_leads"
                      type="number"
                      min="0"
                      value={formData.total_leads || 0}
                      onChange={(e) =>
                        handleInputChange('total_leads', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualified_leads">Leads Qualificados</Label>
                    <Input
                      id="qualified_leads"
                      type="number"
                      min="0"
                      value={formData.qualified_leads || 0}
                      onChange={(e) =>
                        handleInputChange('qualified_leads', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled">Agendados</Label>
                    <Input
                      id="scheduled"
                      type="number"
                      min="0"
                      value={formData.scheduled || 0}
                      onChange={(e) =>
                        handleInputChange('scheduled', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calls_done">Calls Realizadas</Label>
                    <Input
                      id="calls_done"
                      type="number"
                      min="0"
                      value={formData.calls_done || 0}
                      onChange={(e) =>
                        handleInputChange('calls_done', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sales">Vendas</Label>
                    <Input
                      id="sales"
                      type="number"
                      min="0"
                      value={formData.sales || 0}
                      onChange={(e) => handleInputChange('sales', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investment">Investimento (R$)</Label>
                    <Input
                      id="investment"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.investment || 0}
                      onChange={(e) =>
                        handleInputChange('investment', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Metrics Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Métricas</h2>
          {renderMetrics()}
        </div>
      </div>
    </div>
  );
}
