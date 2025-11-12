import type { ProductData } from '@/types/dashboard';

interface StatsPanelProps {
  data: ProductData;
}

export function StatsPanel({ data }: StatsPanelProps) {
  const { semanas, tendencia } = data;

  const totalFaturamentoTrafego = semanas.reduce((sum, s) => sum + s.faturamentoTrafego, 0);
  const totalInvestido = semanas.reduce((sum, s) => sum + s.investido, 0);
  const totalRoasTrafego = semanas.reduce((sum, s) => sum + s.roasTrafego, 0);
  const totalVendaMonetizacao = semanas.reduce((sum, s) => sum + s.vendaMonetizacao, 0);
  const totalEntradas = semanas.reduce((sum, s) => sum + s.entradas, 0);

  return (
    <div className="flex flex-col gap-[15px] max-lg:grid max-lg:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] max-md:flex max-md:flex-col">
      {/* Aquisição */}
      <div className="bg-[hsl(var(--bg-secondary))] p-8 rounded-xl border-l-4 border-[hsl(var(--accent-secondary))] max-md:p-5">
        <div className="text-2xl font-extrabold text-[hsl(var(--text-primary))] mb-[22px] uppercase tracking-wide flex items-center gap-3 max-md:text-xl">
          <span>🎯</span>
          <span>AQUISIÇÃO</span>
        </div>
        
        <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💰 Faturamento Tráfego</span>
          <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
            R$ {totalFaturamentoTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💸 Investimento</span>
          <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
            R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-[18px] max-md:py-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">📊 Lucro Tráfego</span>
          <span className={`text-2xl font-extrabold max-md:text-xl ${totalRoasTrafego >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
            R$ {totalRoasTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tendência Aquisição */}
      {tendencia && (
        <div className="bg-[hsl(var(--bg-primary))] p-[26px] rounded-xl border-l-[3px] border-dashed border-[hsl(var(--accent-secondary))] opacity-95 max-md:p-5">
          <div className="text-[1.3rem] font-extrabold text-[hsl(var(--text-secondary))] mb-[18px] uppercase tracking-wide flex items-center gap-3 max-md:text-[1.1rem]">
            <span>📈</span>
            <span>TENDÊNCIA AQUISIÇÃO</span>
          </div>
          
          <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
            <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💰 Faturamento Tráfego</span>
            <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
              R$ {tendencia.faturamentoTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
            <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💸 Investimento</span>
            <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
              R$ {tendencia.investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-[18px] max-md:py-3">
            <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">📊 Lucro Tráfego</span>
            <span className={`text-2xl font-extrabold max-md:text-xl ${tendencia.roasTrafego >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
              R$ {tendencia.roasTrafego.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Monetização */}
      <div className="bg-[hsl(var(--bg-secondary))] p-8 rounded-xl border-l-4 border-[hsl(var(--success))] max-md:p-5">
        <div className="text-2xl font-extrabold text-[hsl(var(--text-primary))] mb-[22px] uppercase tracking-wide flex items-center gap-3 max-md:text-xl">
          <span>💵</span>
          <span>MONETIZAÇÃO</span>
        </div>
        
        <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💳 Faturamento Monetização</span>
          <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
            R$ {totalVendaMonetizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-[18px] max-md:py-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">📥 Entradas</span>
          <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tendência Monetização */}
      {tendencia && (
        <div className="bg-[hsl(var(--bg-primary))] p-[26px] rounded-xl border-l-[3px] border-dashed border-[hsl(var(--success))] opacity-95 max-md:p-5">
          <div className="text-[1.3rem] font-extrabold text-[hsl(var(--text-secondary))] mb-[18px] uppercase tracking-wide flex items-center gap-3 max-md:text-[1.1rem]">
            <span>📈</span>
            <span>TENDÊNCIA MONETIZAÇÃO</span>
          </div>
          
          <div className="flex justify-between items-center py-[18px] border-b border-[hsl(var(--border-color))] max-md:py-3">
            <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">💳 Faturamento Monetização</span>
            <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
              R$ {tendencia.vendaMonetizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-[18px] max-md:py-3">
            <span className="text-[hsl(var(--text-secondary))] text-[1.15rem] font-semibold max-md:text-[0.95rem]">📥 Entradas</span>
            <span className="text-[hsl(var(--text-primary))] text-2xl font-extrabold max-md:text-xl">
              R$ {tendencia.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
