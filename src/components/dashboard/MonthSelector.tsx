import { MONTHS, getCurrentMonth } from '@/hooks/useDashboardData';

interface MonthSelectorProps {
  currentMonth: string;
  onMonthSelect: (monthId: string) => void;
}

export function MonthSelector({ currentMonth, onMonthSelect }: MonthSelectorProps) {
  const actualCurrentMonth = getCurrentMonth();
  const selectedMonth = MONTHS.find(m => m.id === currentMonth);
  const isActualCurrent = currentMonth === actualCurrentMonth;

  return (
    <div className="flex justify-center items-center gap-[15px] mb-[30px] flex-wrap">
      <div className="flex items-center gap-2.5 p-3 px-5 bg-[hsl(var(--bg-secondary))] border-2 border-[hsl(var(--border-color))] rounded-[10px]">
        <label className="text-[hsl(var(--text-secondary))] text-[0.95rem] font-semibold whitespace-nowrap">
          📅 Selecionar Mês:
        </label>
        <select
          value=""
          onChange={(e) => e.target.value && onMonthSelect(e.target.value)}
          className="py-2.5 px-5 rounded-lg border-2 border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] text-base font-semibold cursor-pointer transition-all duration-300 min-w-[180px] hover:border-[hsl(var(--accent-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] max-md:w-full"
        >
          <option value="">-- Selecione um mês --</option>
          {MONTHS.map(month => (
            <option key={month.id} value={month.id}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center gap-[15px] flex-wrap">
        {selectedMonth && (
          <button
            className={`
              py-4 px-[35px] border-2 border-[hsl(var(--border-color))] rounded-[10px] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] text-[1.15rem] font-bold cursor-pointer transition-all duration-300 relative
              bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] border-[hsl(var(--accent-primary))] text-white shadow-[0_8px_25px_rgba(59,130,246,0.4)] pl-[45px]
              hover:border-[hsl(var(--accent-primary))] hover:-translate-y-0.5
              max-md:py-3 max-md:px-5 max-md:text-sm max-md:pl-[35px]
              max-[480px]:py-2.5 max-[480px]:px-4 max-[480px]:text-[0.85rem] max-[480px]:pl-[30px]
              before:content-['📅'] before:absolute before:left-2.5 before:text-xl before:opacity-100 before:transition-opacity before:duration-300
              max-md:before:left-2 max-md:before:text-base
              max-[480px]:before:left-1.5 max-[480px]:before:text-sm
              ${isActualCurrent ? 'after:content-["Mês_Atual"] after:absolute after:-top-2.5 after:-right-1 after:bg-[hsl(var(--success))] after:text-white after:text-[0.65rem] after:py-[3px] after:px-2 after:rounded-[10px] after:font-bold after:uppercase after:tracking-wider after:shadow-[0_2px_8px_rgba(16,185,129,0.4)] max-md:after:text-[0.55rem] max-md:after:py-0.5 after:px-1.5 max-md:after:-top-2 max-md:after:-right-[3px] max-[480px]:after:text-[0.5rem] max-[480px]:after:py-0.5 max-[480px]:after:px-1 max-[480px]:after:-top-[7px] max-[480px]:after:-right-0.5' : ''}
              ${!isActualCurrent ? 'after:content-["Histórico"] after:absolute after:-top-2.5 after:-right-1 after:bg-[hsl(var(--warning))] after:text-white after:text-[0.65rem] after:py-[3px] after:px-2 after:rounded-[10px] after:font-bold after:uppercase after:tracking-wider after:shadow-[0_2px_8px_rgba(245,158,11,0.4)] max-md:after:text-[0.55rem] max-md:after:py-0.5 max-md:after:px-1.5 max-md:after:-top-2 max-md:after:-right-[3px] max-[480px]:after:text-[0.5rem] max-[480px]:after:py-0.5 max-[480px]:after:px-1 max-[480px]:after:-top-[7px] max-[480px]:after:-right-0.5' : ''}
            `}
            onClick={() => onMonthSelect(selectedMonth.id)}
          >
            {selectedMonth.name}
          </button>
        )}
      </div>
    </div>
  );
}
