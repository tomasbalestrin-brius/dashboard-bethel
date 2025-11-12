import type { ModuleName } from '@/types/dashboard';

interface MobileHeaderProps {
  currentModule: ModuleName;
  onMenuToggle: () => void;
}

export function MobileHeader({ currentModule, onMenuToggle }: MobileHeaderProps) {
  const titles: Record<ModuleName, string> = {
    'dashboard': 'Dashboard',
    'resumo': 'Resumo Geral',
    'comparar-funis': 'Comparar Funis',
    'comparacao': 'Comparar Meses',
    'roi': 'Lucro e ROAS',
    'custos': 'Custo por Lead',
    'insights': 'Insights',
    'exportar': 'Exportar',
  };

  return (
    <div className="hidden max-md:flex fixed top-0 left-0 right-0 h-[60px] bg-[hsl(var(--bg-primary))] border-b-2 border-[hsl(var(--border-color))] z-[1000] items-center justify-between px-5">
      <button
        onClick={onMenuToggle}
        className="w-[45px] h-[45px] bg-transparent border-none text-[hsl(var(--text-primary))] text-2xl cursor-pointer flex items-center justify-center rounded-lg transition-all duration-300 active:bg-[rgba(59,130,246,0.2)]"
      >
        ☰
      </button>
      <div className="text-[1.1rem] font-bold text-[hsl(var(--text-primary))] max-[480px]:text-base">
        {titles[currentModule]}
      </div>
      <div className="w-[45px]"></div>
    </div>
  );
}
