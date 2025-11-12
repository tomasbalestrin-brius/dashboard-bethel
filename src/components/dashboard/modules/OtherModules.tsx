import { MonthSelector } from '../MonthSelector';

export function ROIModule({ allData, currentMonth, onMonthSelect }: any) {
  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          💰 ANÁLISE DE LUCRO E ROAS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] max-md:text-sm">
          Lucro Absoluto e Retorno sobre Investimento
        </p>
      </div>
      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
      <div className="text-center p-10 text-[hsl(var(--text-secondary))]">
        Módulo em desenvolvimento
      </div>
    </div>
  );
}

export function CustosModule({ allData, currentMonth, onMonthSelect }: any) {
  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          📊 CUSTO POR LEAD/VENDA
        </h1>
      </div>
      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
      <div className="text-center p-10 text-[hsl(var(--text-secondary))]">Módulo em desenvolvimento</div>
    </div>
  );
}

export function InsightsModule({ allData, currentMonth, onMonthSelect }: any) {
  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          🤖 INSIGHTS AUTOMÁTICOS
        </h1>
      </div>
      <MonthSelector currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
      <div className="text-center p-10 text-[hsl(var(--text-secondary))]">Módulo em desenvolvimento</div>
    </div>
  );
}

export function CompararFunisModule() {
  return <div className="text-center p-10 text-[hsl(var(--text-secondary))]">Módulo em desenvolvimento</div>;
}

export function ComparacaoModule() {
  return <div className="text-center p-10 text-[hsl(var(--text-secondary))]">Módulo em desenvolvimento</div>;
}

export function ExportarModule() {
  return <div className="text-center p-10 text-[hsl(var(--text-secondary))]">Módulo em desenvolvimento</div>;
}
