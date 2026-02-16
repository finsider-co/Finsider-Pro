
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PieChart, Wallet, Shield, LineChart, Sparkles, Menu, Users, Edit3, LogOut, Download, Flame, Settings, Printer, X, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { CashFlowView } from './components/CashFlowView';
import { BalanceSheetView } from './components/BalanceSheetView';
import { PortfolioView } from './components/PortfolioView';
import { InsuranceAnalysisView } from './components/InsuranceAnalysisView';
import { AIAdvisor } from './components/AIAdvisor';
import { ClientList } from './components/ClientList';
import { DataEditor } from './components/DataEditor';
import { LoginView } from './components/LoginView';
import { FinancialFreedomView } from './components/FinancialFreedomView';
import { AdminSettings } from './components/AdminSettings';
import { UserProfileView } from './components/UserProfileView';
import { PrintableReport } from './components/PrintableReport'; // Import
import { useClient } from './contexts/ClientContext';
import { ViewState } from './types';
import { exportClientToExcel } from './services/exportService';

const App: React.FC = () => {
  const { 
    currentUser, 
    activeClient, 
    clients, 
    login, 
    logout, 
    selectClient, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useClient();

  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // If adding a new client, we might want to switch view automatically
  const handleAddClientWrapper = () => {
    addClient();
    setCurrentView('EDITOR');
  };

  const handleSelectClientWrapper = (clientId: string) => {
    selectClient(clientId);
    setCurrentView('DASHBOARD');
  };

  const handleExport = () => {
    if (activeClient) {
      exportClientToExcel(activeClient);
    }
  };

  const handlePrint = () => {
     // Open the full-screen preview modal
     setIsPrintPreview(true);
  };

  const executeDownloadPDF = () => {
     if (!activeClient) return;
     setIsGeneratingPdf(true);

     const element = document.getElementById('printable-paper');
     if (!element) {
        setIsGeneratingPdf(false);
        return;
     }

     // Configure PDF options for optimal page breaking
     const opt = {
       margin: 0, // We rely on component padding (p-10)
       filename: `FinsiderPro_Report_${activeClient.name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
       image: { type: 'jpeg', quality: 0.98 },
       html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
       // 'css' mode respects 'break-inside: avoid', 'legacy' is a fallback
       pagebreak: { mode: ['css', 'legacy'] } 
     };

     // Access html2pdf from window object (loaded via CDN in index.html)
     // @ts-ignore
     if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
           setIsGeneratingPdf(false);
        }).catch((err: any) => {
           console.error('PDF Generation Error:', err);
           setIsGeneratingPdf(false);
           alert('PDF 生成失敗，請重試 (Failed to generate PDF)');
        });
     } else {
        alert('PDF 庫尚未加載，請稍後再試 (PDF Library not loaded)');
        setIsGeneratingPdf(false);
     }
  };

  // Render Logic
  const renderContent = () => {
    // Admin Settings View (Global)
    if (currentView === 'ADMIN_SETTINGS') {
       return <AdminSettings onClose={() => setCurrentView('DASHBOARD')} />;
    }

    // User Profile View (Global)
    if (currentView === 'PROFILE') {
       return <UserProfileView />;
    }

    // If no client selected, show CRM
    if (!activeClient) {
      return (
        <ClientList 
          clients={clients} 
          onSelectClient={(c) => handleSelectClientWrapper(c.id)}
          onAddClient={handleAddClientWrapper}
          onDeleteClient={deleteClient}
          onOpenProfile={() => setCurrentView('PROFILE')}
        />
      );
    }

    // Client Selected Views
    switch (currentView) {
      case 'DASHBOARD': return <DashboardView data={activeClient} />;
      case 'CASHFLOW': return <CashFlowView data={activeClient} />;
      case 'NETWORTH': return <BalanceSheetView data={activeClient} />;
      case 'EDITOR': return <DataEditor client={activeClient} onSave={(c) => { updateClient(c); alert('已成功儲存！'); }} />;
      case 'PORTFOLIO': return <PortfolioView data={activeClient} />;
      case 'INSURANCE': return <InsuranceAnalysisView data={activeClient} />;
      case 'FIRE': return <FinancialFreedomView data={activeClient} />;
      default: return <DashboardView data={activeClient} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={() => {}} />;
  }

  return (
    <>
      {/* 
        PRINT PREVIEW MODAL 
      */}
      {isPrintPreview && activeClient && (
         <div id="print-preview-modal" className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col animate-fade-in">
            {/* Toolbar */}
            <div id="print-toolbar" className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shadow-xl shrink-0">
               <div className="flex items-center gap-3 text-white">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">報告預覽 (Report Preview)</h2>
                    <p className="text-xs text-slate-400">請確認內容無誤，點擊下載按鈕以儲存 PDF 檔案。</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={() => setIsPrintPreview(false)} 
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <X size={18} /> 關閉 (Close)
                  </button>
                  <button 
                    onClick={executeDownloadPDF} 
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:bg-slate-500 disabled:cursor-wait"
                  >
                    {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isGeneratingPdf ? '生成中 (Generating...)' : '下載 PDF (Download)'}
                  </button>
               </div>
            </div>
            
            {/* Scrollable Preview Area */}
            <div id="print-scroll-container" className="flex-1 overflow-auto p-8 flex justify-center bg-slate-700/50 backdrop-blur-sm">
                {/* 
                   Fixed width for A4 (210mm). 
                   Min-height set to A4 height (297mm) for preview visualization.
                   Height is auto to allow content to grow beyond one page.
                */}
                <div id="printable-paper" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl mx-auto origin-top flex flex-col relative">
                   <PrintableReport client={activeClient} />
                </div>
            </div>
         </div>
      )}

      {/* 
        MAIN APP CONTAINER (id="app-root")
      */}
      <div id="app-root" className={`flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900 ${isPrintPreview ? 'hidden' : ''}`}>
        {/* Sidebar */}
        {(activeClient) && (
          <aside className={`
            ${isSidebarOpen ? 'w-64' : 'w-24'} 
            bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out shadow-2xl z-20
          `}>
            <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950">
               <span className={`text-emerald-400 font-bold text-xl tracking-tight ${!isSidebarOpen && 'text-center text-sm'}`}>
                 {isSidebarOpen ? <span>Finsider<span className="text-white">Pro</span></span> : 'FP'}
               </span>
            </div>

            <div className="p-6 border-b border-slate-800 bg-slate-900">
               <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center flex-col'}`}>
                 <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0 text-lg shadow-lg shadow-emerald-900/20">
                   {activeClient.name.substring(0,1).toUpperCase()}
                 </div>
                 {isSidebarOpen && (
                   <div className="overflow-hidden">
                     <p className="text-sm font-bold text-white truncate">{activeClient.name.split('(')[0]}</p>
                     <p className="text-xs text-emerald-400 mt-0.5">尊貴理財客戶</p>
                   </div>
                 )}
               </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              <NavItem icon={<LayoutDashboard size={20} />} label="儀表板" isActive={currentView === 'DASHBOARD'} isOpen={isSidebarOpen} onClick={() => setCurrentView('DASHBOARD')} />
              <NavItem icon={<Edit3 size={20} />} label="資料編輯" isActive={currentView === 'EDITOR'} isOpen={isSidebarOpen} onClick={() => setCurrentView('EDITOR')} />
              <div className="my-4 border-t border-slate-800 opacity-50"></div>
              <NavItem icon={<Wallet size={20} />} label="現金流分析" isActive={currentView === 'CASHFLOW'} isOpen={isSidebarOpen} onClick={() => setCurrentView('CASHFLOW')} />
              <NavItem icon={<LineChart size={20} />} label="資產負債" isActive={currentView === 'NETWORTH'} isOpen={isSidebarOpen} onClick={() => setCurrentView('NETWORTH')} />
              <NavItem icon={<PieChart size={20} />} label="投資組合" isActive={currentView === 'PORTFOLIO'} isOpen={isSidebarOpen} onClick={() => setCurrentView('PORTFOLIO')} />
              <NavItem icon={<Shield size={20} />} label="保單分析" isActive={currentView === 'INSURANCE'} isOpen={isSidebarOpen} onClick={() => setCurrentView('INSURANCE')} />
              <NavItem icon={<Flame size={20} />} label="財務自由 (FIRE)" isActive={currentView === 'FIRE'} isOpen={isSidebarOpen} onClick={() => setCurrentView('FIRE')} />
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
               <button 
                 onClick={() => selectClient(null)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                 title="切換客戶"
               >
                 <Users size={20} />
                 {isSidebarOpen && <span className="font-medium">切換客戶</span>}
               </button>
               <button 
                 onClick={() => {
                     selectClient(null); 
                     setCurrentView('PROFILE');
                 }}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'} ${currentView === 'PROFILE' ? 'bg-slate-800 text-white' : ''}`}
                 title="個人資料"
               >
                 <Settings size={20} />
                 {isSidebarOpen && <span className="font-medium">個人設定</span>}
               </button>
               <button 
                 onClick={logout}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                 title="登出"
               >
                 <LogOut size={20} />
                 {isSidebarOpen && <span className="font-medium">登出</span>}
               </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc]">
          {/* Header */}
          {activeClient ? (
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
              <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <Menu size={24} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {currentView === 'DASHBOARD' ? '財務概覽 (Overview)' : 
                   currentView === 'EDITOR' ? '資料編輯 (Editor)' : 
                   currentView === 'CASHFLOW' ? '現金流分析 (Cash Flow)' :
                   currentView === 'NETWORTH' ? '資產負債表 (Balance Sheet)' :
                   currentView === 'PORTFOLIO' ? '投資組合 (Portfolio)' : 
                   currentView === 'FIRE' ? '財務自由 (FIRE Calculator)' :
                   currentView === 'ADMIN_SETTINGS' ? '系統管理 (Admin)' :
                   currentView === 'PROFILE' ? '個人資料設定 (Profile)' :
                   '保單分析 (Insurance)'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer active:scale-95 transform"
                  title="下載 PDF"
                >
                  <FileText size={18} />
                  <span className="hidden md:inline">下載 PDF (Report)</span>
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 hover:text-slate-800 transition-colors border border-slate-200"
                >
                  <Download size={18} />
                  <span className="hidden md:inline">匯出 Excel</span>
                </button>
                <button 
                  onClick={() => setIsAdvisorOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles size={18} />
                  AI 智能顧問
                </button>
              </div>
            </header>
          ) : (
            <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10 shadow-lg z-10 text-white">
               <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
                  <Sparkles className="text-emerald-400" size={28} />
                  <span className="font-bold text-2xl tracking-tight">Finsider<span className="text-emerald-400">Pro</span></span>
               </div>
               <div className="flex items-center gap-4">
                 {currentUser.role === 'ADMIN' && (
                   <button 
                      onClick={() => {
                         selectClient(null);
                         setCurrentView('ADMIN_SETTINGS');
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-bold text-sm ${currentView === 'ADMIN_SETTINGS' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                   >
                      <Settings size={18} /> 管理後台
                   </button>
                 )}

                 <button 
                   onClick={() => {
                      selectClient(null);
                      setCurrentView('PROFILE');
                   }}
                   className={`text-sm text-slate-400 bg-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-slate-700 transition-colors ${currentView === 'PROFILE' ? 'ring-2 ring-emerald-500 text-white' : ''}`}
                   title="編輯個人資料"
                 >
                   <span className={`w-2 h-2 rounded-full ${currentUser.role === 'ADMIN' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                   {currentUser.username} <span className="text-xs opacity-50">({currentUser.role})</span>
                 </button>

                 <button onClick={logout} className="text-slate-400 hover:text-white transition-colors" title="登出">
                   <LogOut size={20} />
                 </button>
               </div>
            </header>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto p-8 md:p-10">
             <div className="max-w-7xl mx-auto">
               {renderContent()}
             </div>
          </div>

          {/* AI Sidebar */}
          {activeClient && (
            <AIAdvisor 
              isOpen={isAdvisorOpen} 
              onClose={() => setIsAdvisorOpen(false)} 
              profile={activeClient}
              context={currentView}
            />
          )}
        </main>
      </div>
    </>
  );
};

// Helper Component for Nav Items
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 mb-1.5
      ${isActive ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}
      ${!isOpen && 'justify-center px-2'}
    `}
  >
    {icon}
    {isOpen && <span>{label}</span>}
  </button>
);

export default App;
