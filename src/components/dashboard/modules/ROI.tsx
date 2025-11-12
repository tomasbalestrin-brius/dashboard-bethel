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
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          💰 ANÁLISE DE LUCRO E ROAS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Lucro Absoluto e Retorno sobre Investimento
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-[30px] max-md:grid-cols-1 max-md:gap-[15px]">
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
            <div key={product.id} className="bg-[hsl(var(--bg-secondary))] p-[30px] rounded-2xl border-2 border-[hsl(var(--border-color))] transition-all duration-300 hover:border-[hsl(var(--accent-primary))] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] max-md:p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-[2.5rem]">{product.icon}</div>
                <div className="text-[1.1rem] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wide max-md:text-base">
                  {product.name}
                </div>
              </div>

              <div className="mb-5">
                <div className={`text-[2.5rem] font-bold mb-2.5 max-md:text-[2rem] ${lucroAbsoluto >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
                  {lucroAbsoluto >= 0 ? '+' : ''}R$ {Math.abs(lucroAbsoluto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">Lucro / Prejuízo</div>
              </div>

              <div className="mb-5">
                <div className="text-[2rem] font-bold mb-2.5 text-[#60a5fa]">
                  {roas.toFixed(2)}x
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">ROAS Tráfego</div>
              </div>

              <div className="mb-5">
                <div className="text-[2rem] font-bold mb-2.5 text-[#a78bfa]">
                  {roasFunil.toFixed(2)}x
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">ROAS Funil</div>
              </div>

              <div className="mt-5 pt-5 border-t border-[hsl(var(--border-color))]">
                <div className="text-sm text-[hsl(var(--text-secondary))]">
                  Investido: <strong>R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><br />
                  Retorno: <strong>R$ {totalFaturamentoTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
