import React from 'react';
import { useDepot } from '../context/DepotContext';
import { Cloud, CloudOff, Sun, Moon, UserCheck, Shield, Camera, Menu, X, Plus, Sparkles, Printer, Users, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'inventory' | 'scanner' | 'maintenance' | 'reports';
  onSelectTab: (tab: 'overview' | 'inventory' | 'scanner' | 'maintenance' | 'reports') => void;
  onOpenScanner: () => void;
  onOpenAddEquipment: () => void;
  onOpenSyncQueue: () => void;
  onOpenAiRecognition?: () => void;
  onOpenPrintQr?: () => void;
  onOpenUserRentals?: () => void;
  onOpenManageTaxonomy?: (tab?: 'categories' | 'courses' | 'borrowers') => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  onOpenAddEquipment,
  onOpenSyncQueue,
  onOpenAiRecognition,
  onOpenPrintQr,
  onOpenUserRentals,
  onOpenManageTaxonomy,
  isDark,
  onToggleDark
}) => {
  const { role, setRole, effectiveOnline, syncQueue } = useDepot();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'scanner', label: 'Scanner' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'reports', label: 'Reports' }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            CineTrack Pro
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                if (link.id === 'scanner') {
                  onOpenScanner();
                } else {
                  onSelectTab(link.id);
                }
              }}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                currentTab === link.id && link.id !== 'scanner'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {link.label}
              {currentTab === link.id && link.id !== 'scanner' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}

          {onOpenUserRentals && (
            <button
              type="button"
              onClick={onOpenUserRentals}
              className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
              title="Student borrowers & equipment custody ledger"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Borrowers</span>
            </button>
          )}

          {onOpenManageTaxonomy && (
            <button
              type="button"
              onClick={() => onOpenManageTaxonomy('categories')}
              className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
              title="Department directory: Categories, courses, and student borrowers"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Taxonomy</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action & role / sync status controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Add Asset Quick Button */}
          <button
            type="button"
            onClick={onOpenAddEquipment}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Add Asset</span>
          </button>

          {/* Two-Tier Role Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'manager'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
              title="Supervisor: Full fleet CRUD & academic reports"
            >
              Supervisor
            </button>
            <button
              type="button"
              onClick={() => setRole('crew')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'crew'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
              title="Check-out Crew: Fast barcode check-in/out & inspection sign-off"
            >
              Check-out Crew
            </button>
          </div>

          {/* Sync / Offline Status Button */}
          <button
            type="button"
            onClick={onOpenSyncQueue}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
              effectiveOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}
            title="Cloud Synchronization & Offline Mode"
          >
            {effectiveOnline ? (
              <Cloud className="w-3.5 h-3.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">{effectiveOnline ? 'Cloud Synced' : 'Offline Mode'}</span>
            {syncQueue.length > 0 && (
              <span className="px-1 py-0.2 text-[10px] bg-amber-500 text-white rounded font-bold">
                {syncQueue.length}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* AI Vision Recognition Button */}
          {onOpenAiRecognition && (
            <button
              type="button"
              onClick={onOpenAiRecognition}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
              title="AI Camera Equipment & Defect Recognition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Vision</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Asset</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex flex-col gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.id === 'scanner') {
                    onOpenScanner();
                  } else {
                    onSelectTab(link.id);
                  }
                }}
                className={`text-left px-3 py-2 text-xs font-medium rounded-lg ${
                  currentTab === link.id && link.id !== 'scanner'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}

            {onOpenAiRecognition && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAiRecognition();
                }}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Photo Vision Scan</span>
              </button>
            )}

            {onOpenPrintQr && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPrintQr();
                }}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR Labels</span>
              </button>
            )}

            {onOpenUserRentals && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserRentals();
                }}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Student Rentals & Custody</span>
              </button>
            )}

            {onOpenManageTaxonomy && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenManageTaxonomy('categories');
                }}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Directory & Taxonomy</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAddEquipment();
              }}
              className="text-left px-3 py-2 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Gear</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Role:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setRole('manager')}
                className={`px-2 py-1 rounded text-xs ${role === 'manager' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Supervisor
              </button>
              <button
                onClick={() => setRole('crew')}
                className={`px-2 py-1 rounded text-xs ${role === 'crew' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Crew
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
