import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSDRDailyData } from '@/hooks/useSDRDailyData';
import type { SDRDailyDataInput } from '@/types/dailyData';
import { formatDateForDB } from '@/types/dailyData';

interface SDRDailyInputProps {
  funnelId: string;
  funnelName: string;
}

const classificationConfig = {
  diamante: { label: 'Diamante', icon: '💎', color: 'text-blue-600' },
  ouro: { label: 'Ouro', icon: '🥇', color: 'text-yellow-600' },
  prata: { label: 'Prata', icon: '🥈', color: 'text-gray-600' },
  bronze: { label: 'Bronze', icon: '🥉', color: 'text-orange-600' },
};

export function SDRDailyInput({ funnelId, funnelName }: SDRDailyInputProps) {
  const { getDataByDate, insertData, updateData, loading } = useSDRDailyData(funnelId);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingDataId, setExistingDataId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SDRDailyDataInput>({
    funnel_id: funnelId,
    data_date: formatDateForDB(new Date()),
    leads_total: 0,
    responderam_formulario: 0,
    mql_diamante: 0,
    mql_ouro: 0,
    mql_prata: 0,
    mql_bronze: 0,
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

  // Load data when date changes
  useEffect(() => {
    const loadData = async () => {
      const dateStr = formatDateForDB(selectedDate);
      const existingData = await getDataByDate(funnelId, dateStr);

      if (existingData) {
        setExistingDataId(existingData.id);
        setFormData({
          funnel_id: funnelId,
          data_date: dateStr,
          leads_total: existingData.leads_total,
          responderam_formulario: existingData.responderam_formulario,
          mql_diamante: existingData.mql_diamante,
          mql_ouro: existingData.mql_ouro,
          mql_prata: existingData.mql_prata,
          mql_bronze: existingData.mql_bronze,
          agendamentos_diamante: existingData.agendamentos_diamante,
          agendamentos_ouro: existingData.agendamentos_ouro,
          agendamentos_prata: existingData.agendamentos_prata,
          agendamentos_bronze: existingData.agendamentos_bronze,
          calls_diamante: existingData.calls_diamante,
          calls_ouro: existingData.calls_ouro,
          calls_prata: existingData.calls_prata,
          calls_bronze: existingData.calls_bronze,
          vendas_diamante: existingData.vendas_diamante,
          vendas_ouro: existingData.vendas_ouro,
          vendas_prata: existingData.vendas_prata,
          vendas_bronze: existingData.vendas_bronze,
        });
      } else {
        setExistingDataId(null);
        setFormData((prev) => ({
          ...prev,
          data_date: dateStr,
          leads_total: 0,
          responderam_formulario: 0,
          mql_diamante: 0,
          mql_ouro: 0,
          mql_prata: 0,
          mql_bronze: 0,
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
        }));
      }
    };

    loadData();
  }, [selectedDate, funnelId, getDataByDate]);

  const handleChange = (field: keyof SDRDailyDataInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (existingDataId) {
      await updateData(existingDataId, formData);
    } else {
      await insertData(formData);
    }
  };

  const classifications = ['diamante', 'ouro', 'prata', 'bronze'] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Entrada de Dados Diários - SDR</CardTitle>
            <CardDescription>Funil: {funnelName}</CardDescription>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-[240px] justify-start text-left font-normal')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dados gerais */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="leads_total">Leads Totais</Label>
            <Input
              id="leads_total"
              type="number"
              min="0"
              value={formData.leads_total}
              onChange={(e) => handleChange('leads_total', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responderam_formulario">Responderam Formulário</Label>
            <Input
              id="responderam_formulario"
              type="number"
              min="0"
              value={formData.responderam_formulario}
              onChange={(e) => handleChange('responderam_formulario', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Dados por classificação */}
        <Tabs defaultValue="diamante" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {classifications.map((classification) => {
              const config = classificationConfig[classification];
              return (
                <TabsTrigger key={classification} value={classification} className="gap-2">
                  <span>{config.icon}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {classifications.map((classification) => {
            const config = classificationConfig[classification];
            return (
              <TabsContent key={classification} value={classification} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className={cn('text-xl font-semibold', config.color)}>{config.label}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`mql_${classification}`}>MQL</Label>
                    <Input
                      id={`mql_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`mql_${classification}` as keyof SDRDailyDataInput] as number}
                      onChange={(e) =>
                        handleChange(`mql_${classification}` as keyof SDRDailyDataInput, parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`agendamentos_${classification}`}>Agendamentos</Label>
                    <Input
                      id={`agendamentos_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`agendamentos_${classification}` as keyof SDRDailyDataInput] as number}
                      onChange={(e) =>
                        handleChange(
                          `agendamentos_${classification}` as keyof SDRDailyDataInput,
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`calls_${classification}`}>Calls Realizadas</Label>
                    <Input
                      id={`calls_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`calls_${classification}` as keyof SDRDailyDataInput] as number}
                      onChange={(e) =>
                        handleChange(`calls_${classification}` as keyof SDRDailyDataInput, parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vendas_${classification}`}>Vendas</Label>
                    <Input
                      id={`vendas_${classification}`}
                      type="number"
                      min="0"
                      value={formData[`vendas_${classification}` as keyof SDRDailyDataInput] as number}
                      onChange={(e) =>
                        handleChange(`vendas_${classification}` as keyof SDRDailyDataInput, parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {existingDataId ? 'Atualizar Dados' : 'Salvar Dados'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
