import { ProductData } from '@/types/dashboard';

interface TotaisGerais {
  faturamentoTotal: number;
  faturamentoTendencia: number;
  lucroTotal: number;
  lucroTendencia: number;
}

interface TotaisGeraisProps {
  productData: ProductData | undefined;
  productName: string;
}

function calcularTotaisGerais(productData: ProductData | undefined): TotaisGerais {
  if (!productData) {
    return {
      faturamentoTotal: 0,
      faturamentoTendencia: 0,
      lucroTotal: 0,
      lucroTendencia: 0
    };
  }

  let faturamentoTotal = 0;
  let lucroTotal = 0;

  productData.semanas.forEach(semana => {
    faturamentoTotal += semana.faturamentoFunil;
    lucroTotal += semana.lucroFunil;
  });

  const faturamentoTendencia = productData.tendencia?.faturamentoFunil || 0;
  const lucroTendencia = productData.tendencia?.lucroFunil || 0;

  return {
    faturamentoTotal,
    faturamentoTendencia,
    lucroTotal,
    lucroTendencia
  };
}

export function TotaisGerais({ productData, productName }: TotaisGeraisProps) {
  const totais = calcularTotaisGerais(productData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="w-full mt-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
        💰 TOTAIS - {productName}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">💵</span>
            <h3 className="text-sm font-semibold opacity-90">Faturamento Total</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totais.faturamentoTotal)}</p>
          <p className="text-xs mt-2 opacity-80">(Soma das 4 semanas)</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">📈</span>
            <h3 className="text-sm font-semibold opacity-90">Tendência Faturamento</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totais.faturamentoTendencia)}</p>
          <p className="text-xs mt-2 opacity-80">(Projeção próximo período)</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">💰</span>
            <h3 className="text-sm font-semibold opacity-90">Lucro Total</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totais.lucroTotal)}</p>
          <p className="text-xs mt-2 opacity-80">(Soma das 4 semanas)</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">📊</span>
            <h3 className="text-sm font-semibold opacity-90">Tendência Lucro</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totais.lucroTendencia)}</p>
          <p className="text-xs mt-2 opacity-80">(Projeção próximo período)</p>
        </div>
      </div>
    </div>
  );
}
