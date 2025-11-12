import type { ModuleName } from '@/types/dashboard';

interface SidebarProps {
  currentModule: ModuleName;
  onModuleChange: (module: ModuleName) => void;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentModule, onModuleChange, mobileMenuOpen, onCloseMobile }: SidebarProps) {
  const modules: Array<{ id: ModuleName; icon: string; label: string }> = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard Principal' },
    { id: 'resumo', icon: '📋', label: 'Resumo Geral' },
    { id: 'comparar-funis', icon: '⚔️', label: 'Comparar Funis' },
    { id: 'comparacao', icon: '📅', label: 'Comparar Meses' },
    { id: 'roi', icon: '💰', label: 'Lucro e ROAS' },
    { id: 'custos', icon: '📊', label: 'Custo por Lead' },
    { id: 'insights', icon: '🤖', label: 'Insights Automáticos' },
    { id: 'exportar', icon: '📥', label: 'Exportar' },
  ];

  const handleModuleClick = (moduleId: ModuleName) => {
    onModuleChange(moduleId);
    onCloseMobile();
  };

  return (
    <div className={`
      fixed left-0 top-0 h-screen w-20 bg-[hsl(var(--bg-secondary))] border-r-2 border-[hsl(var(--border-color))] flex flex-col items-center py-5 gap-[15px] z-[1000] shadow-[5px_0_20px_rgba(0,0,0,0.5)]
      max-md:w-[280px] max-md:px-5 max-md:pt-20 max-md:transition-transform max-md:duration-300
      ${mobileMenuOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
    `}>
      {modules.map(module => (
        <button
          key={module.id}
          onClick={() => handleModuleClick(module.id)}
          className={`
            w-[60px] h-[60px] border-none rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] text-2xl cursor-pointer transition-all duration-300 flex items-center justify-center relative hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] hover:scale-110
            ${currentModule === module.id ? 'bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white scale-110 shadow-[0_5px_20px_rgba(59,130,246,0.4)]' : ''}
            max-md:w-full max-md:h-[60px] max-md:flex-row max-md:justify-start max-md:gap-[15px] max-md:px-5 max-md:text-base
          `}
        >
          <span className="max-md:text-[1.8rem]">{module.icon}</span>
          <span className="hidden max-md:block text-[hsl(var(--text-primary))] text-base">
            {module.label}
          </span>
          <span className="absolute left-[75px] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] py-2 px-3 rounded-lg text-sm whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-300 border border-[hsl(var(--border-color))] z-[1001] group-hover:opacity-100 max-md:hidden">
            {module.label}
          </span>
        </button>
      ))}
    </div>
  );
}
