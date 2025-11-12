import { MonthSelector } from '../MonthSelector';
import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { AllData } from '@/types/dashboard';

interface CustosModuleProps {
  allData: AllData;
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function CustosModule({ allData, currentMonth, onMonthSelect }: CustosModuleProps) {
  const produtos = ALL_PRODUCTS.filter(p => p.id !== 'Geral');

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          📊 CUSTO POR LEAD/VENDA
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Análise de CAC e Eficiência
        </p>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-[30px] max-md:grid-cols-1 max-md:gap-[15px]">
        {produtos.map(product => {
          const data = allData[product.id];
          if (!data) return null;

          const { semanas } = data;
          const totalInvestido = semanas.reduce((sum, s) => sum + s.investido, 0);
          const totalAlunos = semanas.reduce((sum, s) => sum + s.alunos, 0);
          const totalQualificados = semanas.reduce((sum, s) => sum + s.qualificados, 0);
          const totalAgendados = semanas.reduce((sum, s) => sum + s.agendados, 0);
          const totalVendas = semanas.reduce((sum, s) => sum + s.numeroVenda, 0);

          const custoAluno = totalAlunos > 0 ? totalInvestido / totalAlunos : 0;
          const custoQualificado = totalQualificados > 0 ? totalInvestido / totalQualificados : 0;
          const custoAgendado = totalAgendados > 0 ? totalInvestido / totalAgendados : 0;
          const custoVenda = totalVendas > 0 ? totalInvestido / totalVendas : 0;

          return (
            <div key={product.id} className="bg-[hsl(var(--bg-secondary))] p-[30px] rounded-2xl border-2 border-[hsl(var(--border-color))] transition-all duration-300 hover:border-[hsl(var(--accent-primary))] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] max-md:p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-[2.5rem]">{product.icon}</div>
                <div className="text-[1.1rem] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wide max-md:text-base">
                  {product.name}
                </div>
              </div>

              <div className="mb-[15px]">
                <div className="text-[1.8rem] font-bold mb-2.5 text-[hsl(var(--text-primary))] max-md:text-[1.6rem]">
                  R$ {custoAluno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">
                  💰 Custo por Aluno ({totalAlunos} alunos)
                </div>
              </div>

              <div className="mb-[15px]">
                <div className="text-[1.8rem] font-bold mb-2.5 text-[hsl(var(--text-primary))] max-md:text-[1.6rem]">
                  R$ {custoQualificado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">
                  ✅ Custo por Qualificado ({totalQualificados})
                </div>
              </div>

              <div className="mb-[15px]">
                <div className="text-[1.8rem] font-bold mb-2.5 text-[hsl(var(--text-primary))] max-md:text-[1.6rem]">
                  R$ {custoAgendado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">
                  📅 Custo por Agendado ({totalAgendados})
                </div>
              </div>

              <div>
                <div className="text-[2rem] font-bold mb-2.5 text-[hsl(var(--success))]">
                  R$ {custoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))]">
                  💼 CAC - Custo por Venda ({totalVendas})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
