import React, { useState, useEffect } from 'react';
import { DepotProvider, useDepot, EmailPreviewData } from './context/DepotContext';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { OverviewView } from './components/OverviewView';
import { InventoryView } from './components/InventoryView';
import { MaintenanceView } from './components/MaintenanceView';
import { MonthlyReportsView } from './components/MonthlyReportsView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReturnModal } from './components/ReturnModal';
import { DamageReportModal } from './components/DamageReportModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { AddEquipmentModal } from './components/AddEquipmentModal';
import { SyncQueueModal } from './components/SyncQueueModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { PrintQrModal } from './components/PrintQrModal';
import { AiRecognitionModal } from './components/AiRecognitionModal';
import { AddGroupModal } from './components/AddGroupModal';
import { GroupLoanModal } from './components/GroupLoanModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { UserRentalsModal } from './components/UserRentalsModal';
import { ManageTaxonomyModal } from './components/ManageTaxonomyModal';
import { ToastContainer } from './components/ToastContainer';
import { EquipmentItem, EquipmentGroup } from './types';
import { Camera, LayoutDashboard, Database, Wrench, BarChart2, CloudOff } from 'lucide-react';

const DepotApp: React.FC = () => {
  const { isOfflineSimulated, toggleOfflineSimulation, equipment } = useDepot();

  const [currentTab, setCurrentTab] = useState<'overview' | 'inventory' | 'scanner' | 'maintenance' | 'reports'>('overview');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('cinetrack_theme');
      return stored ? stored === 'dark' : true; // Default to dark mode for cinema set aesthetic
    } catch {
      return true;
    }
  });

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isDamageOpen, setIsDamageOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSyncQueueOpen, setIsSyncQueueOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  // New feature modals
  const [isPrintQrOpen, setIsPrintQrOpen] = useState(false);
  const [printQrItem, setPrintQrItem] = useState<EquipmentItem | null>(null);
  const [printQrGroup, setPrintQrGroup] = useState<EquipmentGroup | null>(null);

  const [isAiRecognitionOpen, setIsAiRecognitionOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  const [isGroupLoanOpen, setIsGroupLoanOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<EquipmentGroup | null>(null);
  const [groupLoanMode, setGroupLoanMode] = useState<'checkout' | 'return'>('checkout');

  // CSV Import Modal
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);

  // User Rentals Modal
  const [isUserRentalsOpen, setIsUserRentalsOpen] = useState(false);
  const [userRentalsStudentId, setUserRentalsStudentId] = useState('');

  // Department Directory & Taxonomy Modal
  const [isTaxonomyOpen, setIsTaxonomyOpen] = useState(false);
  const [taxonomyDefaultTab, setTaxonomyDefaultTab] = useState<'categories' | 'courses' | 'borrowers'>('categories');

  const [prefilledStudentForCheckout, setPrefilledStudentForCheckout] = useState<{
    name: string;
    id: string;
    email: string;
    course: string;
    project: string;
  } | null>(null);

  const [activeItem, setActiveItem] = useState<EquipmentItem | null>(null);
  const [activeEmail, setActiveEmail] = useState<EmailPreviewData | null>(null);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cinetrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cinetrack_theme', 'light');
    }
  }, [isDark]);

  const handleToggleDark = () => {
    setIsDark(prev => !prev);
  };

  const handleSelectItem = (item: EquipmentItem, action?: 'checkout' | 'return' | 'damage' | 'detail') => {
    setActiveItem(item);
    if (action === 'checkout') {
      setPrefilledStudentForCheckout(null);
      setIsCheckoutOpen(true);
    } else if (action === 'return') {
      setIsReturnOpen(true);
    } else if (action === 'damage') {
      setIsDamageOpen(true);
    } else {
      setIsDetailOpen(true);
    }
  };

  const handleEmailDispatched = (emailData: EmailPreviewData) => {
    setActiveEmail(emailData);
    setIsEmailPreviewOpen(true);
  };

  const handleOpenPrintQr = (item?: EquipmentItem, group?: EquipmentGroup) => {
    setPrintQrItem(item || null);
    setPrintQrGroup(group || null);
    setIsPrintQrOpen(true);
  };

  const handleOpenAiRecognition = () => {
    setIsAiRecognitionOpen(true);
  };

  const handleOpenAddGroup = () => {
    setIsAddGroupOpen(true);
  };

  const handleOpenGroupLoan = (group: EquipmentGroup, mode: 'checkout' | 'return') => {
    setActiveGroup(group);
    setGroupLoanMode(mode);
    setIsGroupLoanOpen(true);
  };

  const handleOpenImportCsv = () => {
    setIsImportCsvOpen(true);
  };

  const handleOpenUserRentals = (studentId?: string) => {
    setUserRentalsStudentId(studentId || '');
    setIsUserRentalsOpen(true);
  };

  const handleOpenTaxonomy = (tab: 'categories' | 'courses' | 'borrowers' = 'categories') => {
    setTaxonomyDefaultTab(tab);
    setIsTaxonomyOpen(true);
  };

  const handleCheckoutToUser = (student: {
    name: string;
    id: string;
    email: string;
    course: string;
    project: string;
  }) => {
    setPrefilledStudentForCheckout(student);
    const available = equipment.find(e => e.status === 'available');
    setActiveItem(available || equipment[0] || null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-20 md:pb-10">
      {/* Offline simulation warning banner if active */}
      {isOfflineSimulated && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4" />
            <span>Simulated Remote Set Mode: Network disconnected. Changes are stored in local offline queue.</span>
          </div>
          <button
            onClick={toggleOfflineSimulation}
            className="text-xs bg-slate-950 text-white px-2.5 py-0.5 rounded-md hover:bg-slate-900 transition-colors"
          >
            Re-enable Online Cloud Sync
          </button>
        </div>
      )}

      {/* Navigation Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddEquipment={() => setIsAddOpen(true)}
        onOpenSyncQueue={() => setIsSyncQueueOpen(true)}
        onOpenAiRecognition={handleOpenAiRecognition}
        onOpenPrintQr={() => handleOpenPrintQr()}
        onOpenUserRentals={() => handleOpenUserRentals()}
        onOpenManageTaxonomy={handleOpenTaxonomy}
        isDark={isDark}
        onToggleDark={handleToggleDark}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Real-time Overdue and Service Countdown Alerts */}
        <AlertBanner
          onSelectItem={handleSelectItem}
          onOpenMaintenanceTab={() => setCurrentTab('maintenance')}
        />

        {currentTab === 'overview' && (
          <OverviewView
            onSelectItem={handleSelectItem}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenDamageReport={() => {
              setActiveItem(null);
              setIsDamageOpen(true);
            }}
            onOpenAddEquipment={() => setIsAddOpen(true)}
            onOpenAiRecognition={handleOpenAiRecognition}
            onOpenPrintQr={item => handleOpenPrintQr(item)}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            onSelectItem={handleSelectItem}
            onOpenAddModal={() => setIsAddOpen(true)}
            onOpenPrintQr={(item, group) => handleOpenPrintQr(item, group)}
            onOpenAiRecognition={handleOpenAiRecognition}
            onOpenAddGroup={handleOpenAddGroup}
            onOpenGroupLoan={handleOpenGroupLoan}
            onOpenImportCsv={handleOpenImportCsv}
            onOpenUserRentals={handleOpenUserRentals}
            onOpenManageTaxonomy={handleOpenTaxonomy}
          />
        )}

        {currentTab === 'maintenance' && (
          <MaintenanceView
            onSelectItem={item => handleSelectItem(item, 'detail')}
            onOpenDamageReport={() => {
              setActiveItem(null);
              setIsDamageOpen(true);
            }}
            onInspectEmail={email => {
              setActiveEmail(email);
              setIsEmailPreviewOpen(true);
            }}
          />
        )}

        {currentTab === 'reports' && <MonthlyReportsView />}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (thumb navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 px-1">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center justify-center h-full text-[10px] font-medium transition-colors ${
            currentTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('inventory')}
          className={`flex flex-col items-center justify-center h-full text-[10px] font-medium transition-colors ${
            currentTab === 'inventory' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Database className="w-5 h-5 mb-0.5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-col items-center justify-center h-full -mt-3"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">Scan</span>
        </button>

        <button
          onClick={() => setCurrentTab('maintenance')}
          className={`flex flex-col items-center justify-center h-full text-[10px] font-medium transition-colors ${
            currentTab === 'maintenance' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span>Service</span>
        </button>

        <button
          onClick={() => setCurrentTab('reports')}
          className={`flex flex-col items-center justify-center h-full text-[10px] font-medium transition-colors ${
            currentTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </button>
      </div>

      {/* Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectItem={handleSelectItem}
        onOpenAiRecognition={handleOpenAiRecognition}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setPrefilledStudentForCheckout(null);
        }}
        item={activeItem}
        prefilledStudent={prefilledStudentForCheckout}
        onOpenManageTaxonomy={handleOpenTaxonomy}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        item={activeItem}
        onTriggerDamageReport={item => {
          setActiveItem(item);
          setIsDamageOpen(true);
        }}
      />

      <DamageReportModal
        isOpen={isDamageOpen}
        onClose={() => setIsDamageOpen(false)}
        initialItem={activeItem}
        onEmailDispatched={handleEmailDispatched}
      />

      <EquipmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={activeItem}
        onCheckout={item => {
          setActiveItem(item);
          setPrefilledStudentForCheckout(null);
          setIsCheckoutOpen(true);
        }}
        onReturn={item => {
          setActiveItem(item);
          setIsReturnOpen(true);
        }}
        onReportDamage={item => {
          setActiveItem(item);
          setIsDamageOpen(true);
        }}
        onOpenPrintQr={item => handleOpenPrintQr(item)}
      />

      <AddEquipmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onOpenImportCsv={handleOpenImportCsv}
        onOpenManageTaxonomy={handleOpenTaxonomy}
      />

      <AddGroupModal
        isOpen={isAddGroupOpen}
        onClose={() => setIsAddGroupOpen(false)}
      />

      <GroupLoanModal
        isOpen={isGroupLoanOpen}
        onClose={() => setIsGroupLoanOpen(false)}
        group={activeGroup}
        mode={groupLoanMode}
      />

      <PrintQrModal
        isOpen={isPrintQrOpen}
        onClose={() => setIsPrintQrOpen(false)}
        items={equipment}
        group={printQrGroup}
        selectedItemId={printQrItem?.id}
      />

      <AiRecognitionModal
        isOpen={isAiRecognitionOpen}
        onClose={() => setIsAiRecognitionOpen(false)}
        onSelectItem={handleSelectItem}
      />

      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
      />

      <UserRentalsModal
        isOpen={isUserRentalsOpen}
        onClose={() => setIsUserRentalsOpen(false)}
        initialStudentId={userRentalsStudentId}
        onCheckoutToUser={handleCheckoutToUser}
        onReturnItem={item => {
          setActiveItem(item);
          setIsReturnOpen(true);
        }}
        onReportDamage={item => {
          setActiveItem(item);
          setIsDamageOpen(true);
        }}
        onPrintQr={item => handleOpenPrintQr(item)}
        onOpenManageTaxonomy={handleOpenTaxonomy}
      />

      <ManageTaxonomyModal
        isOpen={isTaxonomyOpen}
        onClose={() => setIsTaxonomyOpen(false)}
        defaultTab={taxonomyDefaultTab}
        onOpenUserRentals={handleOpenUserRentals}
      />

      <SyncQueueModal
        isOpen={isSyncQueueOpen}
        onClose={() => setIsSyncQueueOpen(false)}
      />

      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        emailData={activeEmail}
      />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <DepotProvider>
      <DepotApp />
    </DepotProvider>
  );
}
