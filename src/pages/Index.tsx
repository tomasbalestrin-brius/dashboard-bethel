import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSelector } from '@/components/dashboard/ThemeSelector';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastContainer } from '@/components/dashboard/Toast';
import { DashboardModule } from '@/components/dashboard/modules/Dashboard';
import { ResumoModule } from '@/components/dashboard/modules/Resumo';
import { ROIModule } from '@/components/dashboard/modules/ROI';
import { CustosModule } from '@/components/dashboard/modules/Custos';
import { InsightsModule } from '@/components/dashboard/modules/Insights';
import { CompararFunisModule } from '@/components/dashboard/modules/CompararFunis';
import { ExportarModule } from '@/components/dashboard/modules/Exportar';
import { ComparacaoModule } from '@/components/dashboard/modules/OtherModules';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { currentUser, logout, hasPermission } = useAuth();
  const {
    allData,
    currentMonth,
    currentTeam,
    currentProduct,
    currentWeek,
    currentModule,
    theme,
    loading,
    mobileMenuOpen,
    toasts,
    selectMonth,
    selectTeam,
    selectProduct,
    setCurrentWeek,
    selectModule,
    changeTheme,
    removeToast,
    setMobileMenuOpen,
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-secondary">
      {/* User Info and Logout */}
      <div className="fixed top-4 right-4 z-[1001] flex items-center gap-3 max-md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Limpar cache
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('dashboard_cache_')) {
                localStorage.removeItem(key);
              }
            });
            window.location.reload();
          }}
          className="h-8 gap-2"
          title="Atualizar dados da planilha"
        >
          🔄 Atualizar
        </Button>
        <div className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{currentUser?.name}</span>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
      <MobileHeader currentModule={currentModule} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {mobileMenuOpen && (
        <div
          className="hidden max-md:block fixed inset-0 bg-black/50 z-[999] opacity-100 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar
        currentModule={currentModule}
        onModuleChange={selectModule}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      
      <BottomNav currentModule={currentModule} onModuleChange={selectModule} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="ml-[240px] p-8 max-md:ml-0 max-md:pt-[76px] max-md:pb-[86px] max-md:px-4">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="text-center p-20">
              <div className="text-5xl mb-4">⏳</div>
              <div className="text-xl text-muted-foreground">Carregando dados...</div>
            </div>
          ) : (
            <>
              {currentModule === 'dashboard' && (
                <DashboardModule
                  allData={allData}
                  currentMonth={currentMonth}
                  currentTeam={currentTeam}
                  currentProduct={currentProduct}
                  currentWeek={currentWeek}
                  onMonthSelect={selectMonth}
                  onTeamSelect={selectTeam}
                  onProductSelect={selectProduct}
                  onWeekChange={setCurrentWeek}
                />
              )}
              {currentModule === 'resumo' && (
                <ResumoModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />
              )}
              {currentModule === 'roi' && <ROIModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
              {currentModule === 'custos' && <CustosModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
              {currentModule === 'insights' && <InsightsModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
              {currentModule === 'comparar-funis' && <CompararFunisModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
              {currentModule === 'comparacao' && <ComparacaoModule />}
              {currentModule === 'exportar' && <ExportarModule />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
