import { MonthSelector } from '../MonthSelector';
import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';

interface InsightsModuleProps {
  allData: AllData;
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function InsightsModule({ allData, currentMonth, onMonthSelect }: InsightsModuleProps) {
  const produtos = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  const insights: Array<{
    type: 'success' | 'danger' | 'warning';
    icon: string;
    title: string;
    description: string;
  }> = [];

  let melhorROI = { produto: '', valor: -Infinity, icon: '' };
  let piorROI = { produto: '', valor: Infinity, icon: '' };
  let melhorTaxaConversao = { produto: '', valor: -Infinity, icon: '' };

  produtos.forEach(product => {
    const data = allData[product.id];
    if (!data) return;

    const { semanas } = data;
    const totalInvestido = semanas.reduce((sum, s) => sum + s.investido, 0);
    const totalFaturado = semanas.reduce((sum, s) => sum + s.faturamentoTrafego, 0);
    const roi = totalInvestido > 0 ? ((totalFaturado - totalInvestido) / totalInvestido * 100) : 0;
    const taxaConversaoMedia = semanas.reduce((sum, s) => sum + s.taxaConversao, 0) / semanas.length;

    if (roi > melhorROI.valor) {
      melhorROI = { produto: product.name, valor: roi, icon: product.icon };
    }
    if (roi < piorROI.valor && roi < 0) {
      piorROI = { produto: product.name, valor: roi, icon: product.icon };
    }
    if (taxaConversaoMedia > melhorTaxaConversao.valor) {
      melhorTaxaConversao = { produto: product.name, valor: taxaConversaoMedia, icon: product.icon };
    }
  });

  if (melhorROI.valor > 0) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'Melhor Performance de ROI',
      description: `${melhorROI.icon} <strong>${melhorROI.produto}</strong> está com excelente ROI de <strong>${melhorROI.valor >= 0 ? '+' : ''}${melhorROI.valor.toFixed(2)}%</strong>! Este produto está gerando retorno positivo sobre o investimento.`,
    });
  }

  if (piorROI.valor < 0) {
    insights.push({
      type: 'danger',
      icon: '⚠️',
      title: 'Atenção: ROI Negativo',
      description: `${piorROI.icon} <strong>${piorROI.produto}</strong> está com ROI negativo de <strong>${piorROI.valor.toFixed(2)}%</strong>. Considere revisar a estratégia de investimento ou otimizar as campanhas.`,
    });
  }

  if (melhorTaxaConversao.valor > 0) {
    insights.push({
      type: 'success',
      icon: '✨',
      title: 'Melhor Taxa de Conversão',
      description: `${melhorTaxaConversao.icon} <strong>${melhorTaxaConversao.produto}</strong> tem a melhor taxa de conversão de <strong>${melhorTaxaConversao.valor.toFixed(2)}%</strong>. Use este produto como referência para otimizar os outros funis.`,
    });
  }

  const geralData = allData['Geral'];
  if (geralData) {
    const totalInvestidoGeral = geralData.semanas.reduce((sum, s) => sum + s.investido, 0);
    const totalFaturadoGeral = geralData.semanas.reduce((sum, s) => sum + s.faturamentoTrafego, 0);
    const margemGeral = totalFaturadoGeral - totalInvestidoGeral;

    insights.push({
      type: margemGeral >= 0 ? 'success' : 'warning',
      icon: margemGeral >= 0 ? '📈' : '📊',
      title: 'Performance Geral do Mês',
      description: `No total, foram investidos <strong>R$ ${totalInvestidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> e faturados <strong>R$ ${totalFaturadoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, resultando em uma margem de <strong>R$ ${margemGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.`,
    });
  }

  insights.push({
    type: 'warning',
    icon: '🎯',
    title: 'Recomendação Estratégica',
    description: 'Baseado nos dados, recomendamos focar os esforços em produtos com ROI positivo e melhorar a taxa de agendamento dos produtos que estão com performance abaixo da média. Considere redistribuir o investimento para maximizar o retorno.',
  });

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          gradient: 'from-red-500/10 to-rose-600/10',
          border: 'border-red-500',
          iconBg: 'from-red-500 to-rose-600',
          shadow: 'shadow-red-500/50',
          badge: 'bg-red-500/20 text-red-400',
          badgeText: 'URGENTE',
        };
      case 'success':
        return {
          gradient: 'from-green-500/10 to-emerald-600/10',
          border: 'border-green-500',
          iconBg: 'from-green-500 to-emerald-600',
          shadow: 'shadow-green-500/50',
          badge: 'bg-green-500/20 text-green-400',
          badgeText: 'TOP',
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500/10 to-amber-600/10',
          border: 'border-yellow-500',
          iconBg: 'from-yellow-500 to-amber-600',
          shadow: 'shadow-yellow-500/50',
          badge: 'bg-yellow-500/20 text-yellow-400',
          badgeText: 'ATENÇÃO',
        };
      default:
        return {
          gradient: 'from-purple-500/10 to-violet-600/10',
          border: 'border-purple-500',
          iconBg: 'from-purple-500 to-violet-600',
          shadow: 'shadow-purple-500/50',
          badge: 'bg-purple-500/20 text-purple-400',
          badgeText: 'DICA',
        };
    }
  };

  return (
    <div className="p-6 max-md:p-4">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-2 max-md:text-2xl">
          💡 INSIGHTS AUTOMÁTICOS
        </h1>
        <p className="text-[hsl(var(--text-secondary))] text-lg max-md:text-sm">
          Análise inteligente dos seus funis e recomendações estratégicas
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="grid gap-6 max-w-5xl mx-auto max-md:gap-4">
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight.type);
          return (
            <div
              key={index}
              className={`relative group animate-fade-in-up delay-${Math.min(index + 1, 7)}`}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} blur-2xl group-hover:blur-3xl transition-all opacity-50`}></div>
              
              {/* Card */}
              <div className={`relative backdrop-blur-xl bg-slate-800/70 border-l-4 ${style.border} rounded-xl p-6 hover:scale-[1.02] transition-all max-md:p-4`}>
                <div className="flex items-start gap-4 max-md:gap-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-xl ${style.shadow} ${insight.type === 'danger' ? 'animate-pulse-slow' : ''} flex-shrink-0`}>
                    <span className="text-3xl">{insight.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-100 max-md:text-base">
                        {insight.title}
                      </h3>
                      <span className={`px-2 py-1 ${style.badge} text-xs font-bold rounded-lg ${insight.type === 'danger' ? 'animate-pulse-slow' : ''}`}>
                        {style.badgeText}
                      </span>
                    </div>
                    <p
                      className="text-slate-300 leading-relaxed max-md:text-sm"
                      dangerouslySetInnerHTML={{ __html: insight.description }}
                    />
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
