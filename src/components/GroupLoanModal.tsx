import React, { useState, useEffect } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentGroup, EquipmentCondition } from '../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { X, Layers, Calendar, Clock, User, CheckCircle2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface GroupLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: EquipmentGroup | null;
  mode: 'checkout' | 'return';
}

export const GroupLoanModal: React.FC<GroupLoanModalProps> = ({
  isOpen,
  onClose,
  group,
  mode
}) => {
  const { equipment, checkoutGroup, returnGroup, addToast, role, courses, borrowers } = useDepot();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [course, setCourse] = useState(() => group?.targetCourse || (courses.length > 0 ? `${courses[0].code}: ${courses[0].title}` : 'FILM 401'));
  const [facultyAdvisor, setFacultyAdvisor] = useState(() => courses.length > 0 ? courses[0].faculty : 'Department Faculty');
  const [projectTitle, setProjectTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState<EquipmentCondition>('good');
  const [staffName, setStaffName] = useState(role === 'manager' ? 'Maya Lin (Cage Supervisor)' : 'Sam Rodriguez (Depot Tech)');

  useEffect(() => {
    if (isOpen && group) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      setDueDate(tomorrow.toISOString().slice(0, 16));

      if (group.targetCourse) {
        setCourse(group.targetCourse);
        const match = courses.find(c => `${c.code}: ${c.title}` === group.targetCourse || group.targetCourse.includes(c.code));
        if (match) setFacultyAdvisor(match.faculty);
      }

      // Check if there is an active loan on any item to prefill student
      const activeLoanItem = equipment.find(e => group.itemIds.includes(e.id) && e.currentLoan);
      if (activeLoanItem?.currentLoan) {
        setStudentName(activeLoanItem.currentLoan.studentName);
        setStudentId(activeLoanItem.currentLoan.studentId);
        setStudentEmail(activeLoanItem.currentLoan.studentEmail);
        setProjectTitle(activeLoanItem.currentLoan.projectTitle);
      } else if (borrowers.length > 0) {
        setStudentName(borrowers[0].name);
        setStudentId(borrowers[0].id);
        setStudentEmail(borrowers[0].email);
        setProjectTitle(borrowers[0].project);
      }
    }
  }, [isOpen, group, equipment, courses, borrowers]);

  if (!isOpen || !group) return null;

  const groupItems = equipment.filter(e => group.itemIds.includes(e.id));
  const availableItems = groupItems.filter(e => e.status === 'available');
  const loanedItems = groupItems.filter(e => e.status === 'checked_out' || e.status === 'overdue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signature) {
      addToast({
        type: 'warning',
        title: 'Digital Signature Required',
        message: 'The student borrower must digitally sign the custody agreement before proceeding.'
      });
      return;
    }

    if (mode === 'checkout') {
      const success = checkoutGroup(group.id, {
        studentName,
        studentId,
        studentEmail,
        course,
        facultyAdvisor,
        projectTitle,
        dueDate: new Date(dueDate).toISOString(),
        signature,
        notes
      });
      if (success) onClose();
    } else {
      const success = returnGroup(group.id, {
        condition,
        notes,
        signature,
        staffName
      });
      if (success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white ${mode === 'checkout' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'checkout' ? 'Check Out Kit Package' : 'Check In & Return Kit Package'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {group.name} · {group.targetCourse.split(':')[0]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Manifest Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Package Manifest ({groupItems.length} items total)
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {mode === 'checkout' ? `${availableItems.length} ready to release` : `${loanedItems.length} active in field`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.barcode}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                    item.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Custody Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student ID Number *
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {mode === 'checkout' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'return' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Package Return Condition
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as EquipmentCondition)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pristine">Pristine - Mint condition, optics clear</option>
                  <option value="good">Good - Normal minor handling wear</option>
                  <option value="fair">Fair - Smudges / dust present</option>
                  <option value="needs_service">Needs Service - Defect or damage noted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Depot Staff
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Canvas Digital Signature Pad */}
          <DigitalSignaturePad
            signerName={studentName}
            roleDescription={mode === 'checkout' ? 'Student Borrower Custody Verification' : 'Student Return Inspection Sign-Off'}
            onSignatureChange={setSignature}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Package Inspection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Flight case foam checked, all lenses capped, batteries accounted for..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                mode === 'checkout'
                  ? 'bg-indigo-600 hover:bg-indigo-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <span>{mode === 'checkout' ? 'Authorize Package Loan' : 'Complete Package Check-In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
