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
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Save, Loader2, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMonetizationDailyData } from '@/hooks/useMonetizationDailyData';
import type { MonetizationDailyDataInput } from '@/types/dailyData';
import { formatDateForDB } from '@/types/dailyData';
import { formatCurrency } from '@/utils/metricsCalculations';

export function MonetizationDailyInput() {
  const { getDataByDate, insertData, updateData, loading } = useMonetizationDailyData();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingDataId, setExistingDataId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MonetizationDailyDataInput>({
    data_date: formatDateForDB(new Date()),
    faturamento: 0,
    entrada: 0,
    alunos_qualificados: 0,
  });

  // Calculate receita por aluno
  const receitaPorAluno =
    formData.alunos_qualificados > 0
      ? formData.faturamento / formData.alunos_qualificados
      : 0;

  // Load data when date changes
  useEffect(() => {
    const loadData = async () => {
      const dateStr = formatDateForDB(selectedDate);
      const existingData = await getDataByDate(dateStr);

      if (existingData) {
        setExistingDataId(existingData.id);
        setFormData({
          data_date: dateStr,
          faturamento: existingData.faturamento,
          entrada: existingData.entrada,
          alunos_qualificados: existingData.alunos_qualificados,
        });
      } else {
        setExistingDataId(null);
        setFormData({
          data_date: dateStr,
          faturamento: 0,
          entrada: 0,
          alunos_qualificados: 0,
        });
      }
    };

    loadData();
  }, [selectedDate, getDataByDate]);

  const handleChange = (field: keyof MonetizationDailyDataInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (existingDataId) {
      await updateData(existingDataId, formData);
    } else {
      await insertData(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Entrada de Dados Diários - Monetização
            </CardTitle>
            <CardDescription>Registre faturamento e entrada do dia</CardDescription>
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
        {/* Input fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faturamento" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Faturamento (Vendas)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="faturamento"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.faturamento}
                  onChange={(e) => handleChange('faturamento', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entrada" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Entrada (Caixa)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="entrada"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.entrada}
                  onChange={(e) => handleChange('entrada', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alunos_qualificados" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Alunos Qualificados
              </Label>
              <Input
                id="alunos_qualificados"
                type="number"
                min="0"
                value={formData.alunos_qualificados}
                onChange={(e) => handleChange('alunos_qualificados', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Preview/Summary */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground mb-1">Resumo do Dia</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(formData.faturamento)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrada</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(formData.entrada)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alunos Qualificados</p>
                  <p className="text-lg font-bold text-foreground">
                    {formData.alunos_qualificados}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-muted-foreground mb-1">Receita por Aluno</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(receitaPorAluno)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.alunos_qualificados > 0
                  ? `Faturamento ÷ ${formData.alunos_qualificados} alunos`
                  : 'Insira alunos qualificados para calcular'}
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="gap-2" size="lg">
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
