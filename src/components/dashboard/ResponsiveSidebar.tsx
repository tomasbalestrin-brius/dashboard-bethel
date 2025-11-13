import { useState, useEffect } from 'react';
import type { ModuleName } from '@/types/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, TrendingUp, DollarSign, Lightbulb, GitCompare, Calendar, Download } from 'lucide-react';

interface ResponsiveSidebarProps {
  currentModule: ModuleName;
  onModuleChange: (moduleId: ModuleName) => void;
  onMinimizeChange?: (minimized: boolean) => void;
}

export function ResponsiveSidebar({ currentModule, onModuleChange, onMinimizeChange }: ResponsiveSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopMinimized, setIsDesktopMinimized] = useState(false);
  const { hasPermission } = useAuth();

  const isMobile = () => window.innerWidth < 1024;

  // Fechar sidebar mobile ao mudar de módulo
  useEffect(() => {
    if (isMobile()) {
      setIsMobileOpen(false);
    }
  }, [currentModule]);

  // Prevenir scroll do body quando sidebar aberta no mobile
  useEffect(() => {
    if (isMobileOpen && isMobile()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Fechar ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notificar pai sobre mudança de estado
  useEffect(() => {
    onMinimizeChange?.(isDesktopMinimized);
  }, [isDesktopMinimized, onMinimizeChange]);

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

  const modules = allModules.filter(module => {
    if (module.id === 'exportar') {
      return hasPermission('all') || hasPermission('export');
    }
    return true;
  });

  const handleNavigate = (moduleId: ModuleName) => {
    onModuleChange(moduleId);
  };

  const toggleDesktopMinimize = () => {
    setIsDesktopMinimized(!isDesktopMinimized);
  };

  return (
    <>
      {/* HAMBURGUER BUTTON - Mobile apenas */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-12 h-12 rounded-xl bg-card/90 backdrop-blur-xl border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-xl"
        aria-label="Abrir menu"
      >
        <div className="flex flex-col gap-1.5 w-6">
          <span className="block h-0.5 bg-foreground rounded-full"></span>
          <span className="block h-0.5 bg-foreground rounded-full"></span>
          <span className="block h-0.5 bg-foreground rounded-full"></span>
        </div>
      </button>

      {/* BACKDROP - Mobile apenas */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border shadow-2xl z-50
          transition-all duration-300 ease-in-out
          
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          
          ${isDesktopMinimized ? 'lg:w-20' : 'lg:w-64'}
          
          w-64
        `}
      >
        {/* HEADER */}
        <div className={`border-b border-border transition-all ${isDesktopMinimized ? 'lg:p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className={`flex items-center gap-3 ${isDesktopMinimized ? 'lg:justify-center lg:w-full' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              {!isDesktopMinimized && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">Dashboard</h3>
                  <p className="text-xs text-muted-foreground truncate">Analytics</p>
                </div>
              )}
            </div>

            {/* Botão Fechar (Mobile) */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              ✕
            </button>

            {/* Botão Minimizar (Desktop) */}
            <button
              onClick={toggleDesktopMinimize}
              className={`hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${isDesktopMinimized ? 'lg:hidden' : ''}`}
            >
              ←
            </button>
          </div>
        </div>

        {/* MENU ITEMS */}
        <nav className={`p-4 space-y-2 overflow-y-auto sidebar-scroll h-[calc(100vh-100px)] ${isDesktopMinimized ? 'lg:p-2' : ''}`}>
          {modules.map((module) => {
            const Icon = module.icon;
            const active = currentModule === module.id;
            
            return (
              <button
                key={module.id}
                onClick={() => handleNavigate(module.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                  ${isDesktopMinimized ? 'lg:justify-center lg:px-2' : ''}
                  ${active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                
                {!isDesktopMinimized && (
                  <span className="font-medium text-sm truncate">{module.label}</span>
                )}
                
                {!isDesktopMinimized && active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></span>
                )}

                {/* Tooltip Desktop Minimizado */}
                {isDesktopMinimized && (
                  <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 border border-border">
                    {module.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botão Expandir quando Minimizada (Desktop) */}
        {isDesktopMinimized && (
          <button
            onClick={toggleDesktopMinimize}
            className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-secondary items-center justify-center text-foreground hover:bg-accent transition-colors shadow-xl"
          >
            →
          </button>
        )}
      </aside>
    </>
  );
}
