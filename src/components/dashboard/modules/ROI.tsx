import { MonthSelector } from '../MonthSelector';
import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';

interface ROIModuleProps {
  allData: AllData;
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function ROIModule({ allData, currentMonth, onMonthSelect }: ROIModuleProps) {
  const produtos = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Análise de Lucro e ROAS
        </h1>
        <p className="text-muted-foreground">
          Lucro Absoluto e Retorno sobre Investimento
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {produtos.map(product => {
          const data = allData[product.id];
          if (!data) return null;

          const { semanas } = data;
          const totalInvestido = semanas.reduce((sum, s) => sum + s.investido, 0);
          const totalFaturamentoTrafego = semanas.reduce((sum, s) => sum + s.faturamentoTrafego, 0);
          const totalFaturamentoFunil = semanas.reduce((sum, s) => sum + s.faturamentoFunil, 0);

          const lucroAbsoluto = totalFaturamentoTrafego - totalInvestido;
          const roas = totalInvestido > 0 ? (totalFaturamentoTrafego / totalInvestido) : 0;
          const roasFunil = totalInvestido > 0 ? (totalFaturamentoFunil / totalInvestido) : 0;

          return (
            <div key={product.id} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                  {product.icon}
                </div>
                <div className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {product.name}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className={`text-3xl font-bold mb-1 ${lucroAbsoluto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {lucroAbsoluto >= 0 ? '+' : ''}R$ {Math.abs(lucroAbsoluto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">Lucro / Prejuízo</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {roas.toFixed(2)}x
                    </div>
                    <div className="text-xs text-muted-foreground">ROAS Tráfego</div>
                  </div>

                  <div>
                    <div className="text-xl font-bold text-purple-600 mb-1">
                      {roasFunil.toFixed(2)}x
                    </div>
                    <div className="text-xs text-muted-foreground">ROAS Funil</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Investido: <span className="font-semibold text-foreground">R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div>Retorno: <span className="font-semibold text-foreground">R$ {totalFaturamentoTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
