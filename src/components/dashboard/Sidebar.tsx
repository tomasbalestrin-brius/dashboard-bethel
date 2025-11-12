import type { ModuleName } from '@/types/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, TrendingUp, DollarSign, Lightbulb, GitCompare, Calendar, Download, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentModule: ModuleName;
  onModuleChange: (moduleId: ModuleName) => void;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentModule, onModuleChange, mobileMenuOpen, onCloseMobile }: SidebarProps) {
  const { currentUser, logout, hasPermission } = useAuth();

  const allModules = [
    { id: 'dashboard' as ModuleName, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'resumo' as ModuleName, icon: FileText, label: 'Resumo Geral' },
    { id: 'roi' as ModuleName, icon: TrendingUp, label: 'Lucro e ROAS' },
    { id: 'custos' as ModuleName, icon: DollarSign, label: 'Custo por Lead' },
    { id: 'insights' as ModuleName, icon: Lightbulb, label: 'Insights' },
    { id: 'comparar-funis' as ModuleName, icon: GitCompare, label: 'Comparar Funis' },
    { id: 'comparacao' as ModuleName, icon: Calendar, label: 'Comparar Meses' },
    { id: 'exportar' as ModuleName, icon: Download, label: 'Exportar' },
  ];

  // Filtrar módulos baseado em permissões
  const modules = allModules.filter(module => {
    if (module.id === 'exportar') {
      return hasPermission('all') || hasPermission('export');
    }
    return true;
  });

  const handleModuleClick = (moduleId: ModuleName) => {
    onModuleChange(moduleId);
    onCloseMobile();
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-[240px] bg-card border-r border-border
        flex flex-col transition-all duration-300 z-[1000]
        max-md:${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="h-[76px] flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            D
          </div>
          <div>
            <div className="font-bold text-foreground">Dashboard</div>
            <div className="text-xs text-muted-foreground">Analytics</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = currentModule === module.id;
            
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{module.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info - Mobile Only */}
      <div className="p-4 border-t border-border hidden max-md:block">
        <div className="bg-secondary rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{currentUser?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{currentUser?.email}</div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
