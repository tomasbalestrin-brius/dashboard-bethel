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

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          🤖 INSIGHTS AUTOMÁTICOS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Análise Inteligente dos Dados
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="flex flex-col gap-5 max-md:gap-[15px]">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`
              bg-[hsl(var(--bg-secondary))] p-[25px] rounded-xl border-l-4 flex gap-5 items-start transition-all duration-300 hover:translate-x-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]
              ${insight.type === 'success' ? 'border-[hsl(var(--success))]' : ''}
              ${insight.type === 'warning' ? 'border-[hsl(var(--warning))]' : ''}
              ${insight.type === 'danger' ? 'border-[hsl(var(--danger))]' : ''}
              max-md:flex-col max-md:p-5 max-md:text-center
            `}
          >
            <div className="text-[2rem] min-w-[50px] text-center">{insight.icon}</div>
            <div className="flex-1">
              <div className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">
                {insight.title}
              </div>
              <div
                className="text-base text-[hsl(var(--text-secondary))] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: insight.description }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
