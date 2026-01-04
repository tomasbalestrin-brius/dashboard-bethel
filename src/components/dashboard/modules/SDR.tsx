import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Save, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSDRFunnels } from '@/hooks/useSDRFunnels';
import { useSDRData } from '@/hooks/useSDRData';
import { FunnelSelector, toFunnelOptions } from '@/components/dashboard/FunnelSelector';
import { AddSDRFunnelModal } from '@/components/dashboard/modals/AddSDRFunnelModal';
import type { FunnelViewMode, LeadClassification, SDRDataInput, MonthCode } from '@/types/funnel';
import { LEAD_CLASSIFICATIONS, MONTHS } from '@/types/funnel';

interface SDRModuleProps {
  currentMonth?: string;
  onMonthSelect?: (monthId: string) => void;
}

export function SDRModule({ currentMonth = 'jan', onMonthSelect }: SDRModuleProps) {
  const { funnels, currentFunnel, setCurrentFunnel, loading: loadingFunnels } = useSDRFunnels();
  const {
    data: sdrData,
    currentMonthData,
    setCurrentMonthData,
    loading: loadingData,
    upsertData,
    getAllMetrics,
    calculateAggregatedMetrics,
  } = useSDRData(currentFunnel?.id || null);

  const [viewMode, setViewMode] = useState<FunnelViewMode>('individual');
  const [saving, setSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<Partial<SDRDataInput>>({
    funnel_id: currentFunnel?.id || '',
    month: currentMonth as MonthCode,
    year: new Date().getFullYear(),
    leads_diamante: 0,
    leads_ouro: 0,
    leads_prata: 0,
    leads_bronze: 0,
    agendamentos_diamante: 0,
    agendamentos_ouro: 0,
    agendamentos_prata: 0,
    agendamentos_bronze: 0,
    calls_diamante: 0,
    calls_ouro: 0,
    calls_prata: 0,
    calls_bronze: 0,
    vendas_diamante: 0,
    vendas_ouro: 0,
    vendas_prata: 0,
    vendas_bronze: 0,
  });

  // Load current month data when funnel or month changes
  useEffect(() => {
    if (currentMonthData) {
      setFormData({
        funnel_id: currentMonthData.funnel_id,
        month: currentMonthData.month,
        year: currentMonthData.year,
        leads_diamante: currentMonthData.leads_diamante,
        leads_ouro: currentMonthData.leads_ouro,
        leads_prata: currentMonthData.leads_prata,
        leads_bronze: currentMonthData.leads_bronze,
        agendamentos_diamante: currentMonthData.agendamentos_diamante,
        agendamentos_ouro: currentMonthData.agendamentos_ouro,
        agendamentos_prata: currentMonthData.agendamentos_prata,
        agendamentos_bronze: currentMonthData.agendamentos_bronze,
        calls_diamante: currentMonthData.calls_diamante,
        calls_ouro: currentMonthData.calls_ouro,
        calls_prata: currentMonthData.calls_prata,
        calls_bronze: currentMonthData.calls_bronze,
        vendas_diamante: currentMonthData.vendas_diamante,
        vendas_ouro: currentMonthData.vendas_ouro,
        vendas_prata: currentMonthData.vendas_prata,
        vendas_bronze: currentMonthData.vendas_bronze,
      });
    } else if (currentFunnel) {
      // Reset form with current funnel and month
      setFormData(prev => ({
        ...prev,
        funnel_id: currentFunnel.id,
        month: currentMonth as MonthCode,
      }));
    }
  }, [currentMonthData, currentFunnel, currentMonth]);

  const handleSave = async () => {
    if (!currentFunnel) return;

    setSaving(true);
    await upsertData(formData as SDRDataInput);
    setSaving(false);
  };

  const handleInputChange = (field: keyof SDRDataInput, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const classifications: LeadClassification[] = ['diamante', 'ouro', 'prata', 'bronze'];

  // Render metrics card
  const renderMetricsCard = () => {
    if (!currentMonthData && viewMode === 'individual') {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum dado disponível para este período
          </CardContent>
        </Card>
      );
    }

    const metrics = viewMode === 'individual' && currentMonthData
      ? getAllMetrics(currentMonthData)
      : [calculateAggregatedMetrics(sdrData)];

    return (
      <div className="grid gap-4">
        {metrics.map((metric) => (
          <Card key={metric.classification}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {metric.classification !== 'geral' && LEAD_CLASSIFICATIONS[metric.classification as LeadClassification].icon}
                <span>
                  {metric.classification === 'geral'
                    ? 'Métricas Gerais'
                    : LEAD_CLASSIFICATIONS[metric.classification as LeadClassification].label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Leads */}
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold">{metric.leads}</p>
                </div>

                {/* Agendamentos + Taxa */}
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos</p>
                  <p className="text-2xl font-bold">{metric.agendamentos}</p>
                  <Badge variant="outline" className="mt-1">
                    {metric.taxa_agendamento.toFixed(1)}%
                  </Badge>
                </div>

                {/* Calls + Taxa */}
                <div>
                  <p className="text-sm text-muted-foreground">Calls</p>
                  <p className="text-2xl font-bold">{metric.calls}</p>
                  <Badge variant="outline" className="mt-1">
                    {metric.taxa_comparecimento.toFixed(1)}%
                  </Badge>
                </div>

                {/* Vendas + Taxa */}
                <div>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                  <p className="text-2xl font-bold">{metric.vendas}</p>
                  <Badge variant="outline" className="mt-1">
                    {metric.taxa_conversao.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              {/* Tax rate details */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Taxa Agendamento</p>
                  <p className="text-lg font-semibold">{metric.taxa_agendamento.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Taxa Comparecimento</p>
                  <p className="text-lg font-semibold">{metric.taxa_comparecimento.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Taxa Conversão</p>
                  <p className="text-lg font-semibold">{metric.taxa_conversao.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render input forms by classification
  const renderInputForms = () => {
    if (!currentFunnel) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Selecione um funil para inserir dados
          </CardContent>
        </Card>
      );
    }

    return (
      <Tabs defaultValue="diamante" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {classifications.map((classification) => (
            <TabsTrigger key={classification} value={classification} className="gap-1">
              <span>{LEAD_CLASSIFICATIONS[classification].icon}</span>
              <span className="hidden sm:inline">{LEAD_CLASSIFICATIONS[classification].label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {classifications.map((classification) => (
          <TabsContent key={classification} value={classification}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {LEAD_CLASSIFICATIONS[classification].icon}
                  {LEAD_CLASSIFICATIONS[classification].label}
                </CardTitle>
                <CardDescription>
                  Insira os dados de {LEAD_CLASSIFICATIONS[classification].label.toLowerCase()} para {MONTHS[formData.month as MonthCode]}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Leads */}
                  <div className="space-y-2">
                    <Label htmlFor={`leads_${classification}`}>Número de Leads</Label>
                    <Input
                      id={`leads_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`leads_${classification}` as keyof SDRDataInput] || 0}
                      onChange={(e) => handleInputChange(`leads_${classification}` as keyof SDRDataInput, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Agendamentos */}
                  <div className="space-y-2">
                    <Label htmlFor={`agendamentos_${classification}`}>Agendamentos</Label>
                    <Input
                      id={`agendamentos_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`agendamentos_${classification}` as keyof SDRDataInput] || 0}
                      onChange={(e) => handleInputChange(`agendamentos_${classification}` as keyof SDRDataInput, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Calls */}
                  <div className="space-y-2">
                    <Label htmlFor={`calls_${classification}`}>Calls Realizadas</Label>
                    <Input
                      id={`calls_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`calls_${classification}` as keyof SDRDataInput] || 0}
                      onChange={(e) => handleInputChange(`calls_${classification}` as keyof SDRDataInput, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Vendas */}
                  <div className="space-y-2">
                    <Label htmlFor={`vendas_${classification}`}>Vendas</Label>
                    <Input
                      id={`vendas_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`vendas_${classification}` as keyof SDRDataInput] || 0}
                      onChange={(e) => handleInputChange(`vendas_${classification}` as keyof SDRDataInput, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Gestão SDR</h1>
        <p className="text-muted-foreground">
          Acompanhe métricas de qualificação e conversão de leads por classificação
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <FunnelSelector
          funnels={toFunnelOptions(funnels)}
          currentFunnelId={currentFunnel?.id || null}
          viewMode={viewMode}
          onFunnelChange={(id) => {
            const funnel = funnels.find(f => f.id === id);
            setCurrentFunnel(funnel || null);
          }}
          onViewModeChange={setViewMode}
          loading={loadingFunnels}
        />

        <AddSDRFunnelModal />
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
          {renderInputForms()}
        </div>

        {/* Right: Metrics Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Métricas</h2>
          {renderMetricsCard()}
        </div>
      </div>
    </div>
  );
}
