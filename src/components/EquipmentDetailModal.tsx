import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem } from '../types';
import { generateBarcodeSvgLines } from '../utils/barcode';
import { X, Calendar, Clock, MapPin, Printer, ShieldCheck, Wrench, Check, ArrowRight, AlertTriangle, User, History } from 'lucide-react';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EquipmentItem | null;
  onCheckout: (item: EquipmentItem) => void;
  onReturn: (item: EquipmentItem) => void;
  onReportDamage: (item: EquipmentItem) => void;
  onOpenPrintQr?: (item: EquipmentItem) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onCheckout,
  onReturn,
  onReportDamage,
  onOpenPrintQr
}) => {
  const { role, loanHistory, scheduleService, deleteEquipmentItem, addToast } = useDepot();

  const [activeTab, setActiveTab] = useState<'specs' | 'custody' | 'maintenance' | 'history'>('specs');
  const [isEditingService, setIsEditingService] = useState(false);
  const [newServiceDate, setNewServiceDate] = useState(item?.maintenanceSchedule.nextServiceDate || '');
  const [newServiceType, setNewServiceType] = useState(item?.maintenanceSchedule.serviceType || '');
  const [newTechnician, setNewTechnician] = useState(item?.maintenanceSchedule.technician || '');
  const [newNotes, setNewNotes] = useState(item?.maintenanceSchedule.notes || '');

  if (!isOpen || !item) return null;

  const barcodeLines = generateBarcodeSvgLines(item.barcode);
  const itemLoans = loanHistory.filter(l => l.equipmentId === item.id);
  const isOverdue = item.status === 'overdue' || (item.currentLoan && new Date(item.currentLoan.dueDate) < new Date());

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleService(item.id, {
      nextServiceDate: newServiceDate,
      serviceType: newServiceType,
      intervalDays: item.maintenanceSchedule.intervalDays,
      technician: newTechnician,
      notes: newNotes
    });
    setIsEditingService(false);
  };

  const handlePrintBarcodeTag = () => {
    if (onOpenPrintQr && item) {
      onOpenPrintQr(item);
    } else {
      window.print();
      addToast({
        type: 'info',
        title: 'Barcode Tag Sent to Print',
        message: `Print layout triggered for ${item.barcode} (${item.name}).`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                {item.brand} · {item.category.toUpperCase()}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                item.status === 'available'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : isOverdue
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : item.status === 'checked_out'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isOverdue ? 'OVERDUE RETURN' : item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{item.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
              <span>Serial: {item.serialNumber}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {item.location}
              </span>
              <span>·</span>
              <span>Valuation: ${item.replacementValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBarcodeTag}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Print Asset Tag"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Tag</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barcode Strip Banner */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* SVG Barcode */}
            <div className="bg-white p-1.5 rounded border border-slate-300 shadow-xs">
              <svg width="180" height="38" className="block">
                {barcodeLines.map((line, idx) => (
                  <rect
                    key={idx}
                    x={line.x}
                    y="2"
                    width={line.width}
                    height="32"
                    fill="#0f172a"
                  />
                ))}
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400">OFFICIAL ASSET BARCODE</p>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{item.barcode}</p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px]">Condition:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{item.condition.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-xs font-medium">
          {[
            { id: 'specs', label: 'Technical Specs' },
            { id: 'custody', label: `Active Loan ${item.currentLoan ? '(1)' : '(None)'}` },
            { id: 'maintenance', label: 'Calibration & Servicing' },
            { id: 'history', label: `Borrowing History (${itemLoans.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Factory Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(item.specs).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-mono">{k}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Eligible University Film Courses:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.eligibleCourses.map(courseCode => (
                    <span
                      key={courseCode}
                      className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {courseCode}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custody' && (
            <div>
              {item.currentLoan ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    isOverdue
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40'
                  } space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-500" />
                        Active Student Borrower:
                      </span>
                      <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        Loan #{item.currentLoan.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Student Name:</span>
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{item.currentLoan.studentName}</span>
                        <span className="text-slate-500 font-mono text-[11px] block">{item.currentLoan.studentId} · {item.currentLoan.studentEmail}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Course & Faculty:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.currentLoan.course}</span>
                        <span className="text-slate-500 text-[11px] block">{item.currentLoan.facultyAdvisor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Project:</span>
                        <span className="text-slate-800 dark:text-slate-200">{item.currentLoan.projectTitle}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Return Due Date:</span>
                        <span className={`font-mono font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                          {new Date(item.currentLoan.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {item.currentLoan.notes && (
                      <div className="text-xs p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-mono">Manifest Notes:</span>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">{item.currentLoan.notes}</p>
                      </div>
                    )}

                    {/* Digital Signature Preview */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          Student Custody Signature (On Record):
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Verified by {item.currentLoan.checkoutStaff}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center h-20">
                        {item.currentLoan.studentSignature ? (
                          <img
                            src={item.currentLoan.studentSignature}
                            alt="Student Digital Signature"
                            className="max-h-16 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">No signature image stored</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-2">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Equipment Available in Depot</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No active student loan. Stored in {item.location} ready for checkout to qualified film students.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    Scheduled Preventative Maintenance:
                  </h4>
                  {role === 'manager' && (
                    <button
                      type="button"
                      onClick={() => setIsEditingService(!isEditingService)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      {isEditingService ? 'Cancel Edit' : 'Edit Schedule'}
                    </button>
                  )}
                </div>

                {!isEditingService ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[11px] block font-mono">Last Serviced:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {item.maintenanceSchedule.lastServicedDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block font-mono">Next Calibration Due:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                          {item.maintenanceSchedule.nextServiceDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block font-mono">Assigned Technician:</span>
                        <span className="text-slate-800 dark:text-slate-200">{item.maintenanceSchedule.technician}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block font-mono">Inspection Interval:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{item.maintenanceSchedule.intervalDays} Days</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block font-mono">Service Scope:</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.maintenanceSchedule.serviceType}</p>
                    </div>

                    {item.maintenanceSchedule.notes && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-mono">Depot Bench Notes:</span>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{item.maintenanceSchedule.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSaveService} className="space-y-3 text-xs pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Next Scheduled Calibration Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newServiceDate}
                        onChange={e => setNewServiceDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Service Scope / Procedures
                      </label>
                      <input
                        type="text"
                        required
                        value={newServiceType}
                        onChange={e => setNewServiceType(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Lab Technician
                      </label>
                      <input
                        type="text"
                        required
                        value={newTechnician}
                        onChange={e => setNewTechnician(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Inspection Bench Notes
                      </label>
                      <textarea
                        rows={2}
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingService(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                      >
                        Save Schedule
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {itemLoans.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <History className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  No prior borrowing history on record for this asset tag.
                </div>
              ) : (
                <div className="space-y-2">
                  {itemLoans.map(loanRec => (
                    <div
                      key={loanRec.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {loanRec.studentName} ({loanRec.studentId})
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          loanRec.status === 'returned'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {loanRec.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{loanRec.course} · {loanRec.projectTitle}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>Checked out: {new Date(loanRec.checkoutDate).toLocaleDateString()}</span>
                        <span>
                          {loanRec.returnDate ? `Returned: ${new Date(loanRec.returnDate).toLocaleDateString()}` : `Due: ${new Date(loanRec.dueDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            {role === 'manager' && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to decommission ${item.name}?`)) {
                    deleteEquipmentItem(item.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Decommission Asset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReportDamage(item);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 dark:border-amber-800/60"
            >
              Report Damage
            </button>

            {item.status === 'available' && (
              <button
                type="button"
                onClick={() => {
                  onCheckout(item);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Check Out to Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {(item.status === 'checked_out' || isOverdue) && (
              <button
                type="button"
                onClick={() => {
                  onReturn(item);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Process Return & Inspect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
