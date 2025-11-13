import { ProductData } from '@/types/dashboard';

interface MetricasCardProps {
  productData: ProductData | undefined;
}

export function MetricasCard({ productData }: MetricasCardProps) {
  const calcularMetricas = () => {
    if (!productData) {
      return {
        totalInvestido: 0,
        totalFaturamento: 0,
        totalLucro: 0,
        totalVendas: 0,
        roi: 0,
        taxaConversao: 0,
        taxaAgendamento: 0
      };
    }

    let totalInvestido = 0;
    let totalFaturamento = 0;
    let totalLucro = 0;
    let totalVendas = 0;
    let somaTaxaConversao = 0;
    let somaTaxaAgendamento = 0;
    let numSemanas = 0;

    productData.semanas.forEach(semana => {
      totalInvestido += semana.investido;
      totalFaturamento += semana.faturamentoFunil;
      totalLucro += semana.lucroFunil;
      totalVendas += semana.numeroVenda;
      somaTaxaConversao += semana.taxaConversao;
      somaTaxaAgendamento += semana.taxaAgendamento;
      numSemanas++;
    });

    const roi = totalInvestido > 0 ? ((totalLucro / totalInvestido) * 100) : 0;
    const taxaConversao = numSemanas > 0 ? (somaTaxaConversao / numSemanas) : 0;
    const taxaAgendamento = numSemanas > 0 ? (somaTaxaAgendamento / numSemanas) : 0;

    return {
      totalInvestido,
      totalFaturamento,
      totalLucro,
      totalVendas,
      roi,
      taxaConversao,
      taxaAgendamento
    };
  };

  const metricas = calcularMetricas();
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const cards = [
    {
      title: 'Investido',
      subtitle: 'Total do período',
      value: formatCurrency(metricas.totalInvestido),
      icon: '💸',
      gradient: 'from-red-500/10 to-red-600/10',
      border: 'border-red-500/20',
      iconBg: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/50',
      textGradient: 'from-red-400 to-red-500',
      barColor: 'bg-red-500/30',
      delay: 'delay-1'
    },
    {
      title: 'Faturamento',
      subtitle: 'Total do período',
      value: formatCurrency(metricas.totalFaturamento),
      icon: '💵',
      gradient: 'from-green-500/10 to-green-600/10',
      border: 'border-green-500/20',
      iconBg: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/50',
      textGradient: 'from-green-400 to-green-500',
      barColor: 'bg-green-500/30',
      delay: 'delay-2'
    },
    {
      title: 'Lucro',
      subtitle: 'Total do período',
      value: formatCurrency(metricas.totalLucro),
      icon: '📈',
      gradient: 'from-blue-500/10 to-blue-600/10',
      border: 'border-blue-500/20',
      iconBg: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/50',
      textGradient: 'from-blue-400 to-blue-500',
      barColor: 'bg-blue-500/30',
      delay: 'delay-3'
    },
    {
      title: 'ROI',
      subtitle: 'Retorno sobre investimento',
      value: `${metricas.roi.toFixed(1)}%`,
      icon: '🎯',
      gradient: 'from-purple-500/10 to-purple-600/10',
      border: 'border-purple-500/20',
      iconBg: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/50',
      textGradient: 'from-purple-400 to-purple-500',
      barColor: 'bg-purple-500/30',
      delay: 'delay-4'
    },
    {
      title: 'Vendas',
      subtitle: 'Total de conversões',
      value: metricas.totalVendas.toString(),
      icon: '🏆',
      gradient: 'from-yellow-500/10 to-yellow-600/10',
      border: 'border-yellow-500/20',
      iconBg: 'from-yellow-500 to-yellow-600',
      shadow: 'shadow-yellow-500/50',
      textGradient: 'from-yellow-400 to-yellow-500',
      barColor: 'bg-yellow-500/30',
      delay: 'delay-5'
    },
    {
      title: 'Taxa de Conversão',
      subtitle: 'Qualificados → Vendas',
      value: `${metricas.taxaConversao.toFixed(1)}%`,
      icon: '📊',
      gradient: 'from-pink-500/10 to-pink-600/10',
      border: 'border-pink-500/20',
      iconBg: 'from-pink-500 to-pink-600',
      shadow: 'shadow-pink-500/50',
      textGradient: 'from-pink-400 to-pink-500',
      barColor: 'bg-pink-500/30',
      delay: 'delay-6'
    },
    {
      title: 'Taxa de Agendamento',
      subtitle: 'Qualificados → Agendados',
      value: `${metricas.taxaAgendamento.toFixed(1)}%`,
      icon: '📅',
      gradient: 'from-indigo-500/10 to-indigo-600/10',
      border: 'border-indigo-500/20',
      iconBg: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/50',
      textGradient: 'from-indigo-400 to-indigo-500',
      barColor: 'bg-indigo-500/30',
      delay: 'delay-7'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br ${card.gradient} border ${card.border} p-6 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer animate-fade-in-up ${card.delay}`}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
              <div>
                <p className="text-sm text-slate-300 font-medium">{card.title}</p>
                <p className="text-xs text-slate-500">{card.subtitle}</p>
              </div>
            </div>
            
            <p className={`text-3xl font-bold bg-gradient-to-r ${card.textGradient} bg-clip-text text-transparent mb-2`}>
              {card.value}
            </p>
            
            {/* Mini sparkline */}
            <div className="flex items-center gap-1 h-8 mt-3">
              {[40, 65, 45, 80, 60, 70, 55].map((height, i) => (
                <div key={i} className={`flex-1 ${card.barColor} rounded-sm transition-all duration-300 group-hover:opacity-100 opacity-70`} style={{height: `${height}%`}}></div>
              ))}
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
