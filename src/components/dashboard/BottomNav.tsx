import type { ModuleName } from '@/types/dashboard';

interface BottomNavProps {
  currentModule: ModuleName;
  onModuleChange: (module: ModuleName) => void;
}

export function BottomNav({ currentModule, onModuleChange }: BottomNavProps) {
  const modules: Array<{ id: ModuleName; icon: string; label: string }> = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'resumo', icon: '📋', label: 'Resumo' },
    { id: 'roi', icon: '💰', label: 'ROI' },
    { id: 'insights', icon: '🤖', label: 'Insights' },
    { id: 'exportar', icon: '📥', label: 'Export' },
  ];

  return (
    <div className="hidden max-md:flex fixed bottom-0 left-0 right-0 h-[70px] bg-[hsl(var(--bg-secondary))] border-t-2 border-[hsl(var(--border-color))] z-[1000] flex-row justify-around items-center px-2.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] max-[480px]:h-[65px] max-[480px]:px-[5px]">
      {modules.map(module => (
        <button
          key={module.id}
          onClick={() => onModuleChange(module.id)}
          className={`
            flex flex-col items-center justify-center gap-1 py-2 px-3 bg-transparent border-none text-[hsl(var(--text-secondary))] text-xs cursor-pointer rounded-lg transition-all duration-300 min-w-[60px] active:scale-95
            ${currentModule === module.id ? 'text-[hsl(var(--accent-primary))] bg-[rgba(59,130,246,0.1)]' : ''}
            max-[480px]:py-1.5 max-[480px]:px-2 max-[480px]:text-[0.65rem] max-[480px]:min-w-[55px]
          `}
        >
          <span className="text-2xl max-[480px]:text-[1.3rem]">{module.icon}</span>
          <span>{module.label}</span>
        </button>
      ))}
    </div>
  );
}
