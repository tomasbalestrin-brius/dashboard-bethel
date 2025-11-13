import { MonthSelector } from '../MonthSelector';
import { ProductGroupNavigation } from '../ProductGroupNavigation';
import { Funnel } from '../Funnel';
import { StatsPanel } from '../StatsPanel';
import { Ranking } from '../Ranking';
import { TotaisGerais } from '../TotaisGerais';
import { MetricasCard } from '../MetricasCard';
import { TabelaSemanas } from '../TabelaSemanas';
import { GraficosEvolucao } from '../GraficosEvolucao';
import type { AllData } from '@/types/dashboard';

interface DashboardModuleProps {
  allData: AllData;
  currentMonth: string;
  currentProduct: string;
  currentWeek: string;
  onMonthSelect: (monthId: string) => void;
  onProductSelect: (productId: string) => void;
  onWeekChange: (week: string) => void;
}

export function DashboardModule({
  allData,
  currentMonth,
  currentProduct,
  currentWeek,
  onMonthSelect,
  onProductSelect,
  onWeekChange,
}: DashboardModuleProps) {
  const productData = allData[currentProduct];

  const getFunnelData = () => {
    if (!productData) return { alunos: 0, qualificados: 0, agendados: 0, callRealizada: 0, vendas: 0 };

    if (currentWeek === 'total') {
      return {
        alunos: productData.semanas.reduce((sum, s) => sum + s.alunos, 0),
        qualificados: productData.semanas.reduce((sum, s) => sum + s.qualificados, 0),
        agendados: productData.semanas.reduce((sum, s) => sum + s.agendados, 0),
        callRealizada: productData.semanas.reduce((sum, s) => sum + s.callRealizada, 0),
        vendas: productData.semanas.reduce((sum, s) => sum + s.numeroVenda, 0),
      };
    } else {
      const weekIndex = parseInt(currentWeek) - 1;
      if (productData.semanas[weekIndex]) {
        const semana = productData.semanas[weekIndex];
        return {
          alunos: semana.alunos,
          qualificados: semana.qualificados,
          agendados: semana.agendados,
          callRealizada: semana.callRealizada,
          vendas: semana.numeroVenda,
        };
      }
    }

    return { alunos: 0, qualificados: 0, agendados: 0, callRealizada: 0, vendas: 0 };
  };

  const funnelData = getFunnelData();
  const periodText = currentWeek === 'total' ? 'Total do Mês' : `Semana ${currentWeek}`;

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          📊 ACOMPANHAMENTO GERAL FUNIS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Análise Completa de Performance por Produto
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
      
      {/* Navegação Hierárquica */}
      <ProductGroupNavigation
        selectedProduct={currentProduct}
        onSelectProduct={onProductSelect}
        availableProducts={Object.keys(allData)}
      />

      {/* Nome do produto em destaque */}
      {productData && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-center text-white max-md:text-2xl">
            {currentProduct}
          </h2>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <MetricasCard productData={productData} />

      {/* Funil - Layout Modificado */}
      <div className="bg-[hsl(var(--bg-secondary))] rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] mb-4 max-md:p-3">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2 max-md:flex-col max-md:items-start max-md:gap-2">
          <h2 className="text-base text-[hsl(var(--text-primary))] max-md:text-sm">
            Funil de Conversão - {currentProduct} ({periodText})
          </h2>
          <div className="flex items-center gap-2 max-md:w-full">
            <label className="text-[hsl(var(--text-secondary))] text-xs font-semibold">📅 Período:</label>
            <select
              value={currentWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="py-1 px-2 rounded-md border-2 border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] text-xs font-semibold cursor-pointer transition-all duration-300 hover:border-[hsl(var(--accent-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))] max-md:w-full"
            >
              <option value="total">Total do Mês</option>
              <option value="1">Semana 1</option>
              <option value="2">Semana 2</option>
              <option value="3">Semana 3</option>
              <option value="4">Semana 4</option>
            </select>
          </div>
        </div>
        
        <Funnel data={funnelData} productName={currentProduct} period={periodText} />
      </div>

      {/* Stats Panel - Movido para baixo */}
      {productData && <StatsPanel data={productData} />}

      {/* Gráficos de Evolução */}
      <GraficosEvolucao productData={productData} productName={currentProduct} />

      {/* Tabela de Semanas */}
      <TabelaSemanas productData={productData} />

      {/* Ranking de Produtos */}
      <Ranking allData={allData} />

      {/* Totais do Produto Selecionado */}
      <TotaisGerais productData={productData} productName={currentProduct} />
    </div>
  );
}
