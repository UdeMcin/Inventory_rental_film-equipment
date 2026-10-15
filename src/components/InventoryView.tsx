import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem, EquipmentCategory, EquipmentGroup } from '../types';
import {
  Search,
  Plus,
  Filter,
  Tag,
  MapPin,
  ArrowRight,
  Check,
  Wrench,
  MoreVertical,
  QrCode,
  Sparkles,
  Layers,
  Printer,
  Trash2,
  Box,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  Users
} from 'lucide-react';

interface InventoryViewProps {
  onSelectItem: (item: EquipmentItem, action?: 'checkout' | 'return' | 'damage' | 'detail') => void;
  onOpenAddModal: () => void;
  onOpenPrintQr?: (item?: EquipmentItem, group?: EquipmentGroup) => void;
  onOpenAiRecognition?: () => void;
  onOpenAddGroup?: () => void;
  onOpenGroupLoan?: (group: EquipmentGroup, mode: 'checkout' | 'return') => void;
  onOpenImportCsv?: () => void;
  onOpenUserRentals?: (studentId?: string) => void;
  onOpenManageTaxonomy?: (tab?: 'categories' | 'courses' | 'borrowers') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onSelectItem,
  onOpenAddModal,
  onOpenPrintQr,
  onOpenAiRecognition,
  onOpenAddGroup,
  onOpenGroupLoan,
  onOpenImportCsv,
  onOpenUserRentals,
  onOpenManageTaxonomy
}) => {
  const { equipment, groups, deleteGroup, role, categories } = useDepot();
  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'groups'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EquipmentCategory>('all');

  const filtered = equipment.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.currentLoan?.studentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredGroups = groups.filter(g => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.targetCourse.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Equipment Fleet Inventory & Catalog
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {equipment.length} Fleet Items · {groups.length} Bundled Production Packages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Vision Button */}
          {onOpenAiRecognition && (
            <button
              type="button"
              onClick={onOpenAiRecognition}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
              title="Recognize equipment & check defects using AI vision camera"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Vision Scan</span>
            </button>
          )}

          {/* Print QR Labels Button */}
          {onOpenPrintQr && (
            <button
              type="button"
              onClick={() => onOpenPrintQr()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              title="Generate printable thermal/case asset labels with high-res QR codes"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print QR Labels</span>
            </button>
          )}

          {/* User Rentals Directory Button */}
          {onOpenUserRentals && (
            <button
              type="button"
              onClick={() => onOpenUserRentals()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              title="View equipment custody and rental history per student"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>User Rentals</span>
            </button>
          )}

          {/* Import from CSV Button */}
          {onOpenImportCsv && (
            <button
              type="button"
              onClick={onOpenImportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
              title="Import equipment assets from external CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Import CSV</span>
            </button>
          )}

          {/* Department Taxonomy & Directory Button */}
          {onOpenManageTaxonomy && (
            <button
              type="button"
              onClick={() => onOpenManageTaxonomy('categories')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              title="Manage equipment categories, curriculum courses, and registered borrowers"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Directory & Taxonomy</span>
            </button>
          )}

          {/* Create Group or Add Asset based on tab */}
          {activeSubTab === 'groups' ? (
            <button
              type="button"
              onClick={onOpenAddGroup}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Kit Group</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Manual Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('individual')}
          className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
            activeSubTab === 'individual'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Individual Equipment Ledger ({filtered.length})</span>
          {activeSubTab === 'individual' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('groups')}
          className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
            activeSubTab === 'groups'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Asset Groups & Production Packages ({groups.length})</span>
          {activeSubTab === 'groups' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              activeSubTab === 'individual'
                ? 'Search inventory records by model, serial, barcode tag...'
                : 'Search packages by group name, course code, equipment...'
            }
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        {activeSubTab === 'individual' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Assets ({equipment.length})
            </button>
            {categories.map(c => {
              const count = equipment.filter(e => e.category === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                    categoryFilter === c.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{c.name}</span>
                  {count > 0 && <span className="opacity-70 text-[10px] font-mono">({count})</span>}
                </button>
              );
            })}
            {onOpenManageTaxonomy && (
              <button
                type="button"
                onClick={() => onOpenManageTaxonomy('categories')}
                className="px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 whitespace-nowrap transition-colors border border-dashed border-indigo-300 dark:border-indigo-800 ml-1"
                title="Add or remove asset categories"
              >
                <Plus className="w-3 h-3" />
                <span>Category</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Individual Equipment High-Density Table */}
      {activeSubTab === 'individual' && (
        <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Equipment / Asset</th>
                  <th className="py-3 px-4 font-semibold">Barcode & Serial</th>
                  <th className="py-3 px-4 font-semibold">Depot Bay</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Current Custody</th>
                  <th className="py-3 px-4 font-semibold">Next Service</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(item => {
                  const isItemOverdue =
                    item.status === 'overdue' ||
                    (item.currentLoan && new Date(item.currentLoan.dueDate) < new Date());

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item, 'detail')}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">
                          {item.brand} · {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.barcode}</div>
                        <div className="text-[10px] text-slate-400">{item.serialNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {item.location}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            item.status === 'available'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isItemOverdue
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold'
                              : item.status === 'checked_out'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isItemOverdue ? 'OVERDUE' : item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {item.currentLoan ? (
                          <div
                            onClick={e => {
                              if (onOpenUserRentals && item.currentLoan) {
                                e.stopPropagation();
                                onOpenUserRentals(item.currentLoan.studentId);
                              }
                            }}
                            className={onOpenUserRentals ? "hover:underline cursor-pointer group/user" : ""}
                            title="Click to view student rental list and active custody"
                          >
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[150px] flex items-center gap-1">
                              <span>{item.currentLoan.studentName}</span>
                              {onOpenUserRentals && <Users className="w-3 h-3 text-indigo-500 opacity-60 group-hover/user:opacity-100 shrink-0" />}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              Due:{' '}
                              {new Date(item.currentLoan.dueDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">In Depot</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {item.maintenanceSchedule.nextServiceDate}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'available' && (
                            <button
                              type="button"
                              onClick={() => onSelectItem(item, 'checkout')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
                            >
                              Check Out
                            </button>
                          )}
                          {(item.status === 'checked_out' || isItemOverdue) && (
                            <button
                              type="button"
                              onClick={() => onSelectItem(item, 'return')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
                            >
                              Return
                            </button>
                          )}
                          {onOpenPrintQr && (
                            <button
                              type="button"
                              onClick={() => onOpenPrintQr(item)}
                              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Print QR Tag for this item"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectItem(item, 'detail')}
                            className="px-2 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Asset Groups & Production Packages */}
      {activeSubTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map(group => {
              const groupItems = equipment.filter(e => group.itemIds.includes(e.id));
              const availableItems = groupItems.filter(e => e.status === 'available');
              const loanedItems = groupItems.filter(
                e => e.status === 'checked_out' || e.status === 'overdue'
              );
              const maintenanceItems = groupItems.filter(e => e.status === 'maintenance');

              const isFullyAvailable = availableItems.length === groupItems.length;
              const hasActiveLoans = loanedItems.length > 0;

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                          {group.targetCourse.split(':')[0]}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {group.description}
                        </p>
                      </div>

                      {role === 'manager' && (
                        <button
                          type="button"
                          onClick={() => deleteGroup(group.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Unbundle Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Availability Barometer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isFullyAvailable
                              ? 'bg-emerald-500 animate-pulse'
                              : hasActiveLoans
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {availableItems.length} of {groupItems.length} Available in Cage
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {loanedItems.length > 0 ? `${loanedItems.length} in field` : 'Ready to release'}
                      </span>
                    </div>

                    {/* Bundled Asset Pills */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                        Bundled Manifest ({groupItems.length} items):
                      </span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {groupItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => onSelectItem(item, 'detail')}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer transition-colors"
                          >
                            <div className="truncate mr-2">
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.barcode} · {item.location}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize shrink-0 ${
                                item.status === 'available'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : item.status === 'overdue'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold'
                                  : item.status === 'checked_out'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Group Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {onOpenPrintQr && (
                        <button
                          type="button"
                          onClick={() => onOpenPrintQr(undefined, group)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                          title="Print thermal/case QR labels for all items in this kit"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Kit Labels</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {hasActiveLoans && onOpenGroupLoan && (
                        <button
                          type="button"
                          onClick={() => onOpenGroupLoan(group, 'return')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Return Kit</span>
                        </button>
                      )}

                      {availableItems.length > 0 && onOpenGroupLoan && (
                        <button
                          type="button"
                          onClick={() => onOpenGroupLoan(group, 'checkout')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <span>Check Out Kit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No Equipment Packages Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create bundled packages like camera kits, lighting packages, or documentary audio bags for quick single-signature borrowing.
              </p>
              <button
                type="button"
                onClick={onOpenAddGroup}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
              >
                Create First Package Group
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
