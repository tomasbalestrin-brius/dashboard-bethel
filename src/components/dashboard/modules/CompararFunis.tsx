import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MonthSelector } from '../MonthSelector';
import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';
import { calculateTotals } from '@/utils/dataParser';

interface CompararFunisModuleProps {
  allData: AllData;
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function CompararFunisModule({ allData, currentMonth, onMonthSelect }: CompararFunisModuleProps) {
  const [funil1, setFunil1] = useState('50 Scripts');
  const [funil2, setFunil2] = useState('Teste');

  const productOptions = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  const data1 = allData[funil1];
  const data2 = allData[funil2];

  if (!data1 || !data2) {
    return (
      <div>
        <div className="text-center mb-10 p-5">
          <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
            ⚔️ COMPARAÇÃO ENTRE FUNIS
          </h1>
        </div>
        <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
        <div className="text-center p-10 text-[hsl(var(--text-secondary))]">
          Carregando dados...
        </div>
      </div>
    );
  }

  const totals1 = calculateTotals(data1.semanas);
  const totals2 = calculateTotals(data2.semanas);

  const product1 = productOptions.find(p => p.id === funil1)!;
  const product2 = productOptions.find(p => p.id === funil2)!;

  const winner = totals1.faturado > totals2.faturado ? 1 : 2;

  // Trigger confetti when winner is determined
  useEffect(() => {
    if (totals1 && totals2) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  }, [winner]);

  const metrics = [
    { label: '💰 Faturamento', key: 'faturado' as const, format: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: '💸 Investimento', key: 'investido' as const, format: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: '📊 Lucro', key: 'lucroFunil' as const, format: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: '👥 Alunos', key: 'alunos' as const, format: (v: number) => v.toString() },
    { label: '💼 Vendas', key: 'vendas' as const, format: (v: number) => v.toString() },
  ];

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          ⚔️ COMPARAÇÃO ENTRE FUNIS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Compare a Performance de Dois Produtos Lado a Lado
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="flex justify-center items-center gap-[30px] mb-10 p-[30px] bg-[hsl(var(--bg-secondary))] rounded-2xl border-2 border-[hsl(var(--border-color))] max-md:flex-col max-md:p-5 max-md:gap-[15px]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.1rem] font-bold uppercase tracking-wider">
            🎯 Funil 1:
          </span>
          <select
            value={funil1}
            onChange={(e) => setFunil1(e.target.value)}
            className="py-[15px] px-[25px] rounded-[10px] border-2 border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 min-w-[200px] hover:border-[hsl(var(--accent-primary))] hover:scale-105 focus:outline-none focus:border-[hsl(var(--accent-primary))] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
          >
            {productOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[2rem] font-black text-[hsl(var(--warning))] px-5 animate-pulse max-md:transform max-md:rotate-90 max-md:text-2xl">
          VS
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-[hsl(var(--text-secondary))] text-[1.1rem] font-bold uppercase tracking-wider">
            🎯 Funil 2:
          </span>
          <select
            value={funil2}
            onChange={(e) => setFunil2(e.target.value)}
            className="py-[15px] px-[25px] rounded-[10px] border-2 border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 min-w-[200px] hover:border-[hsl(var(--accent-primary))] hover:scale-105 focus:outline-none focus:border-[hsl(var(--accent-primary))] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
          >
            {productOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-[30px] max-md:grid-cols-1 max-md:gap-[30px]">
        {/* Funil 1 */}
        <div className={`relative bg-[hsl(var(--bg-secondary))] rounded-2xl p-[25px] border-4 transition-all duration-300 animate-fade-in-up delay-1 max-md:p-5 ${winner === 1 ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-[hsl(var(--border-color))]'}`}>
          {winner === 1 && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-xl animate-pulse-slow"></div>
                <div className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl shadow-green-500/50 animate-bounce-gentle">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-sm font-black text-white uppercase tracking-wider">Vencedor</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="text-center mb-[25px] pb-5 border-b-2 border-[hsl(var(--border-color))]">
            <div className="text-[1.8rem] font-extrabold text-[hsl(var(--text-primary))] mb-1.5">
              {product1.icon} {product1.name}
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            {metrics.map(metric => (
              <div key={metric.key} className="bg-[hsl(var(--bg-primary))] p-[15px] rounded-lg flex justify-between items-center">
                <span className="text-[0.95rem] text-[hsl(var(--text-secondary))] font-semibold">
                  {metric.label}
                </span>
                <span className={`text-[1.3rem] font-bold ${metric.key === 'lucroFunil' ? (totals1[metric.key] >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]') : 'text-[hsl(var(--text-primary))]'}`}>
                  {metric.format(totals1[metric.key])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Funil 2 */}
        <div className={`relative bg-[hsl(var(--bg-secondary))] rounded-2xl p-[25px] border-4 transition-all duration-300 animate-fade-in-up delay-2 max-md:p-5 ${winner === 2 ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-[hsl(var(--border-color))]'}`}>
          {winner === 2 && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-xl animate-pulse-slow"></div>
                <div className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl shadow-green-500/50 animate-bounce-gentle">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-sm font-black text-white uppercase tracking-wider">Vencedor</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="text-center mb-[25px] pb-5 border-b-2 border-[hsl(var(--border-color))]">
            <div className="text-[1.8rem] font-extrabold text-[hsl(var(--text-primary))] mb-1.5">
              {product2.icon} {product2.name}
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            {metrics.map(metric => (
              <div key={metric.key} className="bg-[hsl(var(--bg-primary))] p-[15px] rounded-lg flex justify-between items-center">
                <span className="text-[0.95rem] text-[hsl(var(--text-secondary))] font-semibold">
                  {metric.label}
                </span>
                <span className={`text-[1.3rem] font-bold ${metric.key === 'lucroFunil' ? (totals2[metric.key] >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]') : 'text-[hsl(var(--text-primary))]'}`}>
                  {metric.format(totals2[metric.key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[hsl(var(--bg-primary))] p-[25px] rounded-2xl border-2 border-[hsl(var(--accent-primary))]">
        <div className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-[15px]">
          📊 Análise Comparativa
        </div>
        <div className="text-[1.05rem] text-[hsl(var(--text-secondary))] leading-relaxed">
          {winner === 1 ? (
            <p>
              <strong>{product1.icon} {product1.name}</strong> está apresentando melhor desempenho com um faturamento de <strong>R$ {totals1.faturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, superando {product2.icon} {product2.name} que faturou <strong>R$ {totals2.faturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
            </p>
          ) : (
            <p>
              <strong>{product2.icon} {product2.name}</strong> está apresentando melhor desempenho com um faturamento de <strong>R$ {totals2.faturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, superando {product1.icon} {product1.name} que faturou <strong>R$ {totals1.faturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
