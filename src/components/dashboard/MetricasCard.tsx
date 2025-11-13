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
    let totalQualificados = 0;
    let totalAgendados = 0;

    productData.semanas.forEach(semana => {
      totalInvestido += semana.investido;
      totalFaturamento += semana.faturamentoFunil;
      totalLucro += semana.lucroFunil;
      totalVendas += semana.numeroVenda;
      totalQualificados += semana.qualificados;
      totalAgendados += semana.agendados;
    });

    const roi = totalInvestido > 0 ? ((totalLucro / totalInvestido) * 100) : 0;
    const taxaConversao = totalQualificados > 0 ? ((totalVendas / totalQualificados) * 100) : 0;
    const taxaAgendamento = totalQualificados > 0 ? ((totalAgendados / totalQualificados) * 100) : 0;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Investido */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">💰</span>
          <h3 className="text-sm font-semibold opacity-90">Investido</h3>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(metricas.totalInvestido)}</p>
      </div>

      {/* Faturamento */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">💵</span>
          <h3 className="text-sm font-semibold opacity-90">Faturamento</h3>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(metricas.totalFaturamento)}</p>
      </div>

      {/* Lucro */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">📈</span>
          <h3 className="text-sm font-semibold opacity-90">Lucro</h3>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(metricas.totalLucro)}</p>
      </div>

      {/* ROI */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🎯</span>
          <h3 className="text-sm font-semibold opacity-90">ROI</h3>
        </div>
        <p className="text-3xl font-bold">{metricas.roi.toFixed(1)}%</p>
      </div>

      {/* Vendas */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🏆</span>
          <h3 className="text-sm font-semibold opacity-90">Vendas</h3>
        </div>
        <p className="text-3xl font-bold">{metricas.totalVendas}</p>
      </div>

      {/* Taxa de Conversão */}
      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">📊</span>
          <h3 className="text-sm font-semibold opacity-90">Taxa de Conversão</h3>
        </div>
        <p className="text-3xl font-bold">{metricas.taxaConversao.toFixed(1)}%</p>
      </div>

      {/* Taxa de Agendamento */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">📅</span>
          <h3 className="text-sm font-semibold opacity-90">Taxa de Agendamento</h3>
        </div>
        <p className="text-3xl font-bold">{metricas.taxaAgendamento.toFixed(1)}%</p>
      </div>
    </div>
  );
}
