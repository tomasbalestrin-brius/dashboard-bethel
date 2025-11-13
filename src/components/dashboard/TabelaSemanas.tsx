import { ProductData } from '@/types/dashboard';

interface TabelaSemanasProps {
  productData: ProductData | undefined;
}

export function TabelaSemanas({ productData }: TabelaSemanasProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  if (!productData) {
    return null;
  }

  return (
    <div className="mb-8 bg-[hsl(var(--bg-secondary))] rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-foreground">📅 Detalhamento por Semana</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--bg-tertiary))]">
            <tr>
              <th className="p-3 text-left text-foreground">Período</th>
              <th className="p-3 text-right text-foreground">Investido</th>
              <th className="p-3 text-right text-foreground">Faturamento</th>
              <th className="p-3 text-right text-foreground">Lucro</th>
              <th className="p-3 text-right text-foreground">ROAS</th>
              <th className="p-3 text-right text-foreground">Vendas</th>
              <th className="p-3 text-right text-foreground">Taxa Conv.</th>
            </tr>
          </thead>
          <tbody>
            {productData.semanas.map((semana, index) => (
              <tr key={index} className="border-b border-[hsl(var(--border-color))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                <td className="p-3 font-semibold text-foreground">Semana {index + 1}</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(semana.investido)}</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(semana.faturamentoFunil)}</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(semana.lucroFunil)}</td>
                <td className="p-3 text-right text-foreground">{semana.roasTrafego.toFixed(2)}</td>
                <td className="p-3 text-right text-foreground">{semana.numeroVenda}</td>
                <td className="p-3 text-right text-foreground">{formatPercent(semana.taxaConversao)}</td>
              </tr>
            ))}
            {productData.tendencia && (
              <tr className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 font-bold">
                <td className="p-3 text-foreground">📈 Tendência</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(productData.tendencia.investido)}</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(productData.tendencia.faturamentoFunil)}</td>
                <td className="p-3 text-right text-foreground">{formatCurrency(productData.tendencia.lucroFunil)}</td>
                <td className="p-3 text-right text-foreground">{productData.tendencia.roasTrafego.toFixed(2)}</td>
                <td className="p-3 text-right text-foreground">{productData.tendencia.numeroVenda}</td>
                <td className="p-3 text-right text-foreground">{formatPercent(productData.tendencia.taxaConversao)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
