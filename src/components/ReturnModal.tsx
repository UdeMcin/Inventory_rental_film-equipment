import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem, EquipmentCondition } from '../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, CheckSquare, ClipboardCheck, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EquipmentItem | null;
  onTriggerDamageReport?: (item: EquipmentItem) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  item,
  onTriggerDamageReport
}) => {
  const { returnItem, role, addToast } = useDepot();

  const [condition, setCondition] = useState<EquipmentCondition>('good');
  const [notes, setNotes] = useState('');
  const [staffName, setStaffName] = useState(role === 'manager' ? 'Maya Lin (Cage Supervisor)' : 'Sam Rodriguez (Depot Tech)');
  const [studentSignature, setStudentSignature] = useState('');
  const [staffVerified, setStaffVerified] = useState(true);
  
  // Inspection checklist items
  const [checklist, setChecklist] = useState({
    opticsClean: true,
    mountLocked: true,
    batteriesCharged: true,
    cablesPresent: true,
    caseLatchesIntact: true
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen || !item) return null;

  const loan = item.currentLoan;
  const isOverdue = item.status === 'overdue' || (loan && new Date(loan.dueDate) < new Date());
  const returningStudentName = loan?.studentName || 'Student Borrower';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentSignature) {
      addToast({
        type: 'warning',
        title: 'Student Return Signature Required',
        message: 'The returning student must sign the canvas signature pad to certify equipment condition and custody hand-off.'
      });
      return;
    }

    const success = returnItem(item.id, {
      condition,
      notes: notes || 'Returned with all accessories verified against packing manifest.',
      signature: studentSignature,
      staffName
    });

    if (success) {
      onClose();
      // If condition was needs service, offer to immediately file incident report
      if (condition === 'needs_service' && onTriggerDamageReport) {
        onTriggerDamageReport(item);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Return Inspection & Custody Verification Form
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>Return Check-in: {item.name}</span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Tag: {item.barcode} · Serial: {item.serialNumber} · Restock Shelf: {item.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Overdue alert banner if applicable */}
          {isOverdue && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <span className="font-bold">Overdue Return Verified:</span> Gear was past scheduled class return time. Signing and processing this return will clear the academic hold on the student record.
              </div>
            </div>
          )}

          {/* Current Borrower Info */}
          {loan && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Returning Student Custodian:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{loan.studentName} ({loan.studentId})</span>
                <span className="text-[11px] font-mono text-slate-400 block">{loan.studentEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Course Assignment:</span>
                <span className="text-slate-800 dark:text-slate-200 truncate">{loan.course}</span>
                <span className="text-[11px] text-slate-500 block">{loan.projectTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Checked Out On:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(loan.checkoutDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Scheduled Due Date:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {new Date(loan.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Inspection Physical Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
              Physical Bench Inspection Checklist:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                onClick={() => toggleCheck('opticsClean')}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                  checklist.opticsClean
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <input type="checkbox" checked={checklist.opticsClean} readOnly className="sr-only" />
                <CheckCircle2 className={`w-4 h-4 ${checklist.opticsClean ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>Optics / sensor glass scratch-free</span>
              </label>

              <label
                onClick={() => toggleCheck('mountLocked')}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                  checklist.mountLocked
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <input type="checkbox" checked={checklist.mountLocked} readOnly className="sr-only" />
                <CheckCircle2 className={`w-4 h-4 ${checklist.mountLocked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>Lens mount / pins undamaged</span>
              </label>

              <label
                onClick={() => toggleCheck('batteriesCharged')}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                  checklist.batteriesCharged
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <input type="checkbox" checked={checklist.batteriesCharged} readOnly className="sr-only" />
                <CheckCircle2 className={`w-4 h-4 ${checklist.batteriesCharged ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>Power distro & battery clips verified</span>
              </label>

              <label
                onClick={() => toggleCheck('cablesPresent')}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                  checklist.cablesPresent
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <input type="checkbox" checked={checklist.cablesPresent} readOnly className="sr-only" />
                <CheckCircle2 className={`w-4 h-4 ${checklist.cablesPresent ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>All cables & caps accounted for</span>
              </label>
            </div>
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Verified Return Condition:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'pristine', label: 'Pristine (Clean)', desc: 'Flawless condition' },
                { val: 'good', label: 'Good (Nominal)', desc: 'Standard set wear' },
                { val: 'fair', label: 'Fair (Cosmetic)', desc: 'Minor exterior scuffs' },
                { val: 'needs_service', label: 'Needs Service / Damage', desc: 'Fault / repair required' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setCondition(opt.val as EquipmentCondition)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    condition === opt.val
                      ? opt.val === 'needs_service'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 font-semibold ring-2 ring-red-500/20'
                        : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-semibold text-xs">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Student Return Custody Digital Signature Pad */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Student Custody Verification Signature
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {returningStudentName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The student returning the equipment must sign below to certify that all items, lenses, and accessories are returned in the condition stated above, releasing custody back to the university depot.
            </p>

            <DigitalSignaturePad
              signerName={returningStudentName}
              roleDescription="Returning Student Custodian"
              onSignatureChange={setStudentSignature}
            />
          </div>

          {/* Verifying Staff Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verifying Cage Staff Inspector
              </label>
              <input
                type="text"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Physical inspection verified by depot personnel</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Return Inspection Notes & Restock Bay
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Returned with all 4 cine prime caps clean, optics blown off with rocket blower, Pelican latch checked..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Confirm Student Signature & Restock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
