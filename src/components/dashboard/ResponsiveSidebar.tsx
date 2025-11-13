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

  // Fechar sidebar mobile ao mudar de módulo
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  }, [currentModule]);

  // Prevenir scroll do body quando sidebar aberta no mobile
  useEffect(() => {
    if (isMobileOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Fechar ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
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

  const modules = [
    { id: 'dashboard' as ModuleName, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'resumo' as ModuleName, icon: FileText, label: 'Resumo Geral' },
    { id: 'roi' as ModuleName, icon: TrendingUp, label: 'Lucro e ROAS' },
    { id: 'custos' as ModuleName, icon: DollarSign, label: 'Custo por Lead' },
    { id: 'insights' as ModuleName, icon: Lightbulb, label: 'Insights' },
    { id: 'comparar-funis' as ModuleName, icon: GitCompare, label: 'Comparar Funis' },
    { id: 'comparacao' as ModuleName, icon: Calendar, label: 'Comparar Meses' },
    { id: 'exportar' as ModuleName, icon: Download, label: 'Exportar' },
  ];

  const handleNavigate = (moduleId: ModuleName) => {
    onModuleChange(moduleId);
    // Fechar sidebar no mobile
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* HAMBURGUER BUTTON - Mobile apenas */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] w-12 h-12 rounded-xl bg-slate-800/90 backdrop-blur-xl border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors shadow-xl lg:hidden"
        aria-label="Abrir menu"
      >
        <div className="flex flex-col gap-1.5 w-6">
          <span className="block h-0.5 bg-white rounded-full"></span>
          <span className="block h-0.5 bg-white rounded-full"></span>
          <span className="block h-0.5 bg-white rounded-full"></span>
        </div>
      </button>

      {/* BACKDROP - Mobile apenas */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-card backdrop-blur-xl 
          border-r border-border shadow-2xl
          transition-all duration-300 ease-in-out
          w-64
          -translate-x-full
          ${isMobileOpen ? '!translate-x-0' : ''}
          lg:translate-x-0
          ${isDesktopMinimized ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* HEADER */}
        <div className={`border-b border-slate-800/50 transition-all ${isDesktopMinimized ? 'lg:p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className={`flex items-center gap-3 ${isDesktopMinimized ? 'lg:justify-center lg:w-full' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                <span className="text-2xl">📊</span>
              </div>
              {!isDesktopMinimized && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">Dashboard</h3>
                  <p className="text-xs text-slate-400 truncate">Analytics</p>
                </div>
              )}
            </div>

            {/* Botão Fechar (Mobile) */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            {/* Botão Minimizar (Desktop) */}
            {!isDesktopMinimized && (
              <button
                onClick={() => setIsDesktopMinimized(true)}
                className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ←
              </button>
            )}
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
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                
                {!isDesktopMinimized && (
                  <span className="font-medium text-sm truncate">{module.label}</span>
                )}
                
                {!isDesktopMinimized && active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-purple-500"></span>
                )}

                {/* Tooltip Desktop Minimizado */}
                {isDesktopMinimized && (
                  <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                    {module.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botão Expandir quando Minimizada (Desktop) */}
        {isDesktopMinimized && (
          <button
            onClick={() => setIsDesktopMinimized(false)}
            className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800 items-center justify-center text-white hover:bg-slate-700 transition-colors shadow-xl"
          >
            →
          </button>
        )}
      </aside>
    </>
  );
}
