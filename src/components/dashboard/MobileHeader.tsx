import type { ModuleName } from '@/types/dashboard';
import { Menu } from 'lucide-react';

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
    <div className="hidden max-md:flex fixed top-0 left-0 right-0 h-[60px] bg-card border-b border-border z-[1000] items-center justify-between px-4 shadow-sm">
      <button
        onClick={onMenuToggle}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
      <div className="text-sm font-semibold text-foreground">
        {titles[currentModule]}
      </div>
      <div className="w-10"></div>
    </div>
  );
}
