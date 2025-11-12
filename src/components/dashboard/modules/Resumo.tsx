import { MonthSelector } from '../MonthSelector';
import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';

interface ResumoModuleProps {
  allData: AllData;
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function ResumoModule({ allData, currentMonth, onMonthSelect }: ResumoModuleProps) {
  const produtos = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          📋 RESUMO GERAL
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Visão Consolidada de Todos os Funis
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[25px] mb-[30px] max-md:grid-cols-1 max-md:gap-5">
        {produtos.map(product => {
          const data = allData[product.id];
          if (!data) return null;

          const { semanas, tendencia } = data;

          const faturamentoFunil = semanas.reduce((sum, s) => sum + s.faturamentoFunil, 0);
          const lucroFunil = semanas.reduce((sum, s) => sum + s.lucroFunil, 0);
          const tendenciaFaturamento = tendencia ? tendencia.faturamentoFunil : 0;
          const tendenciaLucro = tendencia ? tendencia.lucroFunil : 0;

          const lucroClass = lucroFunil > 0 ? 'positive' : lucroFunil < 0 ? 'negative' : 'neutral';

          const variacaoFaturamento = faturamentoFunil > 0
            ? ((tendenciaFaturamento - faturamentoFunil) / faturamentoFunil * 100)
            : 0;
          const variacaoLucro = lucroFunil !== 0
            ? ((tendenciaLucro - lucroFunil) / Math.abs(lucroFunil) * 100)
            : 0;

          const trendFaturamento = variacaoFaturamento > 5 ? 'up' : variacaoFaturamento < -5 ? 'down' : 'neutral';
          const trendLucro = variacaoLucro > 5 ? 'up' : variacaoLucro < -5 ? 'down' : 'neutral';

          return (
            <div key={product.id} className="bg-[hsl(var(--bg-secondary))] rounded-2xl p-[25px] border-2 border-[hsl(var(--border-color))] transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] hover:border-[hsl(var(--accent-primary))] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[hsl(var(--accent-primary))] before:to-[hsl(var(--accent-secondary))] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 max-md:p-5">
              <div className="flex items-center gap-3 mb-5 pb-[15px] border-b-2 border-[hsl(var(--border-color))]">
                <div className="text-[2.5rem] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] max-md:text-[2rem]">
                  {product.icon}
                </div>
                <div className="text-[1.1rem] font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide max-md:text-base">
                  {product.name}
                </div>
              </div>

              <div className="mb-[25px]">
                <div className="text-[0.85rem] text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">
                  💰 Lucro / Prejuízo
                </div>
                <div className={`text-[2.2rem] font-extrabold leading-none mb-1.5 max-md:text-[1.8rem] ${lucroClass === 'positive' ? 'text-[hsl(var(--success))]' : lucroClass === 'negative' ? 'text-[hsl(var(--danger))]' : 'text-[hsl(var(--text-primary))]'}`}>
                  {lucroFunil >= 0 ? '+' : ''}R$ {Math.abs(lucroFunil).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex flex-col gap-[15px]">
                <div className="flex justify-between items-center py-3 border-b border-[rgba(71,85,105,0.3)]">
                  <span className="text-sm text-[hsl(var(--text-secondary))] font-semibold max-md:text-[0.85rem]">
                    💵 Faturamento do Funil
                  </span>
                  <span className="text-xl font-bold text-[hsl(var(--text-primary))] max-md:text-[1.05rem]">
                    R$ {faturamentoFunil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-[rgba(71,85,105,0.3)]">
                  <span className="text-sm text-[hsl(var(--text-secondary))] font-semibold max-md:text-[0.85rem]">
                    📈 Tendência Faturamento
                  </span>
                  <span className="text-xl font-bold text-[hsl(var(--accent-primary))] max-md:text-[1.05rem]">
                    R$ {tendenciaFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-[20px] text-xs font-bold ml-2 max-md:text-[0.7rem] max-md:py-[3px] max-md:px-2 max-md:ml-1 ${trendFaturamento === 'up' ? 'bg-[rgba(16,185,129,0.15)] text-[hsl(var(--success))]' : trendFaturamento === 'down' ? 'bg-[rgba(239,68,68,0.15)] text-[hsl(var(--danger))]' : 'bg-[rgba(148,163,184,0.15)] text-[hsl(var(--text-secondary))]'}`}>
                      {trendFaturamento === 'up' ? '↗' : trendFaturamento === 'down' ? '↘' : '→'}
                      {Math.abs(variacaoFaturamento).toFixed(1)}%
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
