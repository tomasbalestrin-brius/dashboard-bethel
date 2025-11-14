import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBranding } from '@/hooks/useBranding';
import { ThemeSelector } from '@/components/dashboard/ThemeSelector';
import { ResponsiveSidebar } from '@/components/dashboard/ResponsiveSidebar';
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
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { UserMenu } from '@/components/UserMenu';
import { OrganizationSwitcher } from '@/components/dashboard/OrganizationSwitcher';

const Index = () => {
  useBranding(); // Aplicar branding da organização
  
  const {
    allData,
    currentMonth,
    currentTeam,
    currentProduct,
    currentWeek,
    currentModule,
    theme,
    loading,
    toasts,
    selectMonth,
    selectTeam,
    selectProduct,
    setCurrentWeek,
    selectModule,
    changeTheme,
    removeToast,
  } = useDashboardData();

  const [sidebarMinimized, setSidebarMinimized] = React.useState(false);

  return (
    <div className="min-h-screen bg-secondary">
      {/* User Menu */}
      <div className="fixed top-4 right-4 z-[1001] max-md:hidden">
        <UserMenu />
      </div>

      <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
      
      <ResponsiveSidebar
        currentModule={currentModule}
        onModuleChange={selectModule}
        onMinimizeChange={setSidebarMinimized}
      />
      
      <BottomNav currentModule={currentModule} onModuleChange={selectModule} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={`transition-all duration-300 ease-in-out min-h-screen pt-20 px-4 pb-8 lg:pt-8 lg:pb-8 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
                  currentProduct={currentProduct}
                  currentWeek={currentWeek}
                  onMonthSelect={selectMonth}
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

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
    </div>
  );
};

export default Index;
