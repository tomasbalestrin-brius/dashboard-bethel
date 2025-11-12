import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';
import { calculateTotals } from '@/utils/dataParser';

interface RankingProps {
  allData: AllData;
}

export function Ranking({ allData }: RankingProps) {
  const produtos = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  const produtosRanking = produtos.map(product => {
    const data = allData[product.id];
    if (!data) return null;

    const totals = calculateTotals(data.semanas);
    const lucroTrafego = totals.faturado - totals.investido;

    return {
      ...product,
      totalFaturamento: totals.faturado,
      totalLucroTrafego: lucroTrafego,
      totalLucroFunil: totals.lucroFunil,
      totalVendas: totals.vendas,
    };
  }).filter(Boolean);

  const rankings = [
    {
      title: '💎 Maior Faturamento',
      icon: '👑',
      key: 'totalFaturamento' as const,
      format: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '💎 Maior Lucro Tráfego',
      icon: '💎',
      key: 'totalLucroTrafego' as const,
      format: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '💎 Maior Lucro no Funil',
      icon: '🌟',
      key: 'totalLucroFunil' as const,
      format: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '🎁 Mais Vendas',
      icon: '🔥',
      key: 'totalVendas' as const,
      format: (val: number) => `${val} vendas`,
    },
  ];

  // Se não há dados suficientes, não renderizar
  if (produtosRanking.length === 0) {
    return null;
  }

  return (
    <div className="bg-[hsl(var(--bg-secondary))] rounded-2xl p-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <h2 className="text-[1.8rem] mb-[25px] text-center text-[hsl(var(--text-primary))]">
        🏆 RANKING DE PRODUTOS - COMPARAÇÃO
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-md:grid-cols-1 max-md:gap-[15px]">
        {rankings.map(ranking => {
          const sorted = [...(produtosRanking as any[])].sort((a, b) => b[ranking.key] - a[ranking.key]);
          const winner = sorted[0];

          // Validar se winner existe
          if (!winner) return null;

          return (
            <div
              key={ranking.key}
              className="bg-[hsl(var(--bg-tertiary))] p-5 rounded-xl text-center border-2 border-[hsl(var(--border-color))] transition-all duration-300 hover:border-[hsl(var(--accent-primary))] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.3)] max-md:p-5"
            >
              <div className="text-[2rem] mb-2.5">{ranking.icon}</div>
              <div className="text-[hsl(var(--text-secondary))] text-sm mb-2.5">{ranking.title}</div>
              <div className="text-[1.3rem] font-bold text-[hsl(var(--text-primary))] mb-1.5">
                {winner.icon} {winner.name}
              </div>
              <div className="text-[1.1rem] font-semibold text-[hsl(var(--accent-primary))]">
                {ranking.format(winner[ranking.key])}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
