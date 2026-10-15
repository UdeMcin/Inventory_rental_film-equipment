import React, { useState, useMemo } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../types';
import { generateBarcodeSvgLines } from '../utils/barcode';
import { Search, Filter, Camera, ArrowRight, Check, Wrench, ShieldAlert, MapPin, Tag, User, Clock, Plus, Sparkles, Printer } from 'lucide-react';

interface OverviewViewProps {
  onSelectItem: (item: EquipmentItem, action?: 'checkout' | 'return' | 'damage' | 'detail') => void;
  onOpenScanner: () => void;
  onOpenDamageReport: () => void;
  onOpenAddEquipment: () => void;
  onOpenAiRecognition?: () => void;
  onOpenPrintQr?: (item?: EquipmentItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectItem,
  onOpenScanner,
  onOpenDamageReport,
  onOpenAddEquipment,
  onOpenAiRecognition,
  onOpenPrintQr
}) => {
  const { equipment, availableCount, checkedOutCount, maintenanceCount, overdueItems, role } = useDepot();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EquipmentCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EquipmentStatus>('all');

  const totalValuation = useMemo(() => {
    return equipment.reduce((acc, curr) => acc + curr.replacementValue, 0);
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue' && item.status !== 'overdue') return false;
        if (statusFilter !== 'overdue' && item.status !== statusFilter) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBarcode = item.barcode.toLowerCase().includes(q);
        const matchesSerial = item.serialNumber.toLowerCase().includes(q);
        const matchesStudent = item.currentLoan?.studentName.toLowerCase().includes(q);
        const matchesLocation = item.location.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        return matchesName || matchesBarcode || matchesSerial || matchesStudent || matchesLocation || matchesBrand;
      }
      return true;
    });
  }, [equipment, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header with Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Equipment Depot Command Center
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {equipment.length} Tracked Assets · ${totalValuation.toLocaleString()} Fleet Valuation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiRecognition && (
            <button
              type="button"
              onClick={onOpenAiRecognition}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
              title="Recognize cinema gear and optical condition via AI camera vision"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Vision Scan</span>
            </button>
          )}

          {onOpenPrintQr && (
            <button
              type="button"
              onClick={() => onOpenPrintQr()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              title="Print scannable thermal/flight case QR labels"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print QR Labels</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddEquipment}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Add Asset</span>
          </button>

          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Barcode</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Total Fleet Size
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{equipment.length} Units</p>
          <div className="text-[11px] font-mono text-slate-500">
            ${totalValuation.toLocaleString()} Value
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Available in Cage
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{availableCount}</p>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Ready for checkout
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            On Student Loan
          </span>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{checkedOutCount}</p>
          <div className="text-[11px] font-mono text-slate-500">
            Active coursework
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Overdue Returns
          </span>
          <p className={`text-2xl font-bold font-mono ${overdueItems.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {overdueItems.length}
          </p>
          <div className={`text-[11px] font-mono ${overdueItems.length > 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500'}`}>
            {overdueItems.length > 0 ? 'Academic hold active' : 'All loans on schedule'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Service & Repair
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{maintenanceCount}</p>
          <div className="text-[11px] font-mono text-slate-500">
            Bench diagnostics
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search equipment, tag barcode, serial, borrower name, or bay location..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Gear' },
            { id: 'camera', label: 'Cameras' },
            { id: 'lens', label: 'Lenses' },
            { id: 'lighting', label: 'Lighting' },
            { id: 'audio', label: 'Audio' },
            { id: 'monitoring', label: 'Monitors' },
            { id: 'grip', label: 'Grip' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-slate-400 text-[11px] shrink-0">Status View:</span>
        {[
          { id: 'all', label: 'All States' },
          { id: 'available', label: 'Available' },
          { id: 'checked_out', label: 'On Loan' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'maintenance', label: 'In Maintenance' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id as any)}
            className={`px-2.5 py-1 rounded-md border transition-all whitespace-nowrap ${
              statusFilter === s.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No equipment matched your filters</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or register a new cinema asset.</p>
          <button
            type="button"
            onClick={onOpenAddEquipment}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Asset Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map(item => {
            const isItemOverdue = item.status === 'overdue' || (item.currentLoan && new Date(item.currentLoan.dueDate) < new Date());
            const barcodeLines = generateBarcodeSvgLines(item.barcode);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item, 'detail')}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all hover:border-indigo-500/50 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 ${
                  isItemOverdue
                    ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {item.brand} · {item.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ${
                      item.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : isItemOverdue
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800/40 font-bold'
                        : item.status === 'checked_out'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                    }`}>
                      {isItemOverdue ? 'OVERDUE' : item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.barcode}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Loan or Maintenance Status */}
                {item.currentLoan ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {item.currentLoan.studentName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{item.currentLoan.studentId}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Due:</span>
                      <span className={isItemOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {new Date(item.currentLoan.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ) : item.status === 'maintenance' ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs space-y-0.5">
                    <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1 text-[11px]">
                      <Wrench className="w-3 h-3" />
                      Bench Maintenance
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                      {item.maintenanceSchedule.serviceType}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-xs flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                      Available in {item.location}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ${item.replacementValue.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-mono text-slate-400">
                    Next Svc: {item.maintenanceSchedule.nextServiceDate.slice(5)}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {item.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => onSelectItem(item, 'checkout')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Check Out</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {(item.status === 'checked_out' || isItemOverdue) && (
                      <button
                        type="button"
                        onClick={() => onSelectItem(item, 'return')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Return</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectItem(item, 'detail')}
                      className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
