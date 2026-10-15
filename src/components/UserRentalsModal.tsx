import React, { useState, useMemo } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem, LoanRecord } from '../types';
import {
  Users,
  Search,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Tag,
  Mail,
  Printer,
  Download,
  Plus,
  Box,
  FileCheck2,
  ExternalLink,
  QrCode,
  Trash2,
  Layers,
  GraduationCap
} from 'lucide-react';

interface UserRentalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutToUser?: (student: { name: string; id: string; email: string; course: string; project: string }) => void;
  onReturnItem?: (item: EquipmentItem) => void;
  onReportDamage?: (item: EquipmentItem) => void;
  onPrintQr?: (item: EquipmentItem) => void;
  onOpenManageTaxonomy?: (tab?: 'categories' | 'courses' | 'borrowers') => void;
  initialStudentId?: string;
}

export const UserRentalsModal: React.FC<UserRentalsModalProps> = ({
  isOpen,
  onClose,
  onCheckoutToUser,
  onReturnItem,
  onReportDamage,
  onPrintQr,
  onOpenManageTaxonomy,
  initialStudentId
}) => {
  const { equipment, loanHistory, addToast, borrowers, addBorrower, removeBorrower, courses } = useDepot();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // New quick borrower form state
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCourse, setRegCourse] = useState(courses[0]?.code || 'FILM 401');
  const [regProject, setRegProject] = useState('');

  // Collect unique students from dynamic directory AND loan history AND active loans
  const allBorrowers = useMemo(() => {
    const map = new Map<string, {
      name: string;
      id: string;
      email: string;
      course: string;
      project: string;
    }>();

    // From persistent borrowers directory
    borrowers.forEach(b => {
      map.set(b.id, {
        name: b.name,
        id: b.id,
        email: b.email,
        course: b.course,
        project: b.project
      });
    });

    // From active equipment loans
    equipment.forEach(item => {
      if (item.currentLoan) {
        if (!map.has(item.currentLoan.studentId)) {
          map.set(item.currentLoan.studentId, {
            name: item.currentLoan.studentName,
            id: item.currentLoan.studentId,
            email: item.currentLoan.studentEmail,
            course: item.currentLoan.course,
            project: item.currentLoan.projectTitle
          });
        }
      }
    });

    // From loan history
    loanHistory.forEach(l => {
      if (l.studentId && !map.has(l.studentId)) {
        map.set(l.studentId, {
          name: l.studentName,
          id: l.studentId,
          email: l.studentEmail,
          course: l.course,
          project: l.projectTitle
        });
      }
    });

    return Array.from(map.values());
  }, [borrowers, equipment, loanHistory]);

  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>(() => {
    return initialStudentId || allBorrowers[0]?.id || '';
  });

  // Keep selected ID valid if list changes
  const effectiveBorrowerId = useMemo(() => {
    if (selectedBorrowerId && allBorrowers.some(b => b.id === selectedBorrowerId)) {
      return selectedBorrowerId;
    }
    return allBorrowers[0]?.id || '';
  }, [selectedBorrowerId, allBorrowers]);

  if (!isOpen) return null;

  const currentBorrower = allBorrowers.find(b => b.id === effectiveBorrowerId) || allBorrowers[0];

  // Active items currently checked out to this borrower
  const borrowerActiveLoans = equipment.filter(
    item =>
      item.currentLoan &&
      (item.currentLoan.studentId === currentBorrower?.id ||
        item.currentLoan.studentName.toLowerCase() === currentBorrower?.name.toLowerCase())
  );

  // Past loans for this borrower from loanHistory
  const borrowerHistoryLoans = loanHistory.filter(
    l =>
      l.studentId === currentBorrower?.id ||
      l.studentName.toLowerCase() === currentBorrower?.name.toLowerCase()
  );

  const filteredBorrowers = allBorrowers.filter(b => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.course.toLowerCase().includes(q)
    );
  });

  const handleRegisterBorrowerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId.trim() || !regName.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Student ID and name are required.'
      });
      return;
    }

    const emailToUse = regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@university.edu`;
    const cleanId = regId.trim().toUpperCase();

    const success = addBorrower({
      id: cleanId,
      name: regName.trim(),
      email: emailToUse,
      course: regCourse || (courses[0]?.code || 'FILM 401'),
      project: regProject.trim() || 'Film Production Project'
    });

    if (success) {
      setSelectedBorrowerId(cleanId);
      setIsRegistering(false);
      setRegId('');
      setRegName('');
      setRegEmail('');
      setRegProject('');
    }
  };

  const handleRemoveCurrentBorrower = () => {
    if (!currentBorrower) return;

    if (borrowerActiveLoans.length > 0) {
      addToast({
        type: 'error',
        title: 'Active Custody Conflict',
        message: `${currentBorrower.name} still has ${borrowerActiveLoans.length} equipment item(s) on loan. Check in all equipment before removing borrower.`
      });
      return;
    }

    const success = removeBorrower(currentBorrower.id);
    if (success) {
      // Pick next available
      const remaining = allBorrowers.filter(b => b.id !== currentBorrower.id);
      setSelectedBorrowerId(remaining[0]?.id || '');
    }
  };

  const handleExportUserCsv = () => {
    if (!currentBorrower) return;

    const headers = [
      'Record Type',
      'Equipment Name',
      'Barcode',
      'Checkout Date',
      'Due Date',
      'Return Date',
      'Status',
      'Course',
      'Project'
    ];

    const activeRows = borrowerActiveLoans.map(item => [
      'ACTIVE_RENTAL',
      `"${item.name.replace(/"/g, '""')}"`,
      item.barcode,
      item.currentLoan?.checkoutDate || '',
      item.currentLoan?.dueDate || '',
      'IN_CUSTODY',
      item.status.toUpperCase(),
      `"${currentBorrower.course.replace(/"/g, '""')}"`,
      `"${currentBorrower.project.replace(/"/g, '""')}"`
    ]);

    const historyRows = borrowerHistoryLoans.map(l => [
      'RETURNED_RENTAL',
      `"${l.equipmentName.replace(/"/g, '""')}"`,
      l.equipmentBarcode,
      l.checkoutDate,
      l.dueDate,
      l.returnDate || '',
      l.status.toUpperCase(),
      `"${l.course.replace(/"/g, '""')}"`,
      `"${l.projectTitle.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...activeRows.map(r => r.join(',')), ...historyRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CineTrack_Rentals_${currentBorrower.name.replace(/\s+/g, '_')}_${currentBorrower.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Rental Statement Exported',
      message: `Equipment custody statement downloaded for ${currentBorrower.name}.`
    });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Student Borrowers & Equipment Custody Directory
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Individual user rental ledgers, active field gear, return deadlines & verified signatures
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenManageTaxonomy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageTaxonomy('borrowers');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                title="Manage full directory, courses and categories"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Manage Directory</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Borrower Selector (Left) & Active Rental Ledger (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Borrower List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
            {/* Search Box & Quick Add Button */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filter borrowers..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                    isRegistering
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                  title={isRegistering ? 'Cancel registration' : 'Register new student borrower'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Inline Quick Register Form */}
              {isRegistering && (
                <form
                  onSubmit={handleRegisterBorrowerSubmit}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 shadow-xs animate-in slide-in-from-top-2"
                >
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Plus className="w-3 h-3 text-indigo-500" />
                    Quick Student Registration
                  </span>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Student ID (e.g. STU-2026-09)"
                      value={regId}
                      onChange={e => setRegId(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1 text-[11px] font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Maya Chen)"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <select
                      value={regCourse}
                      onChange={e => setRegCourse(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {courses.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code}: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Project (e.g. Senior Thesis Short)"
                      value={regProject}
                      onChange={e => setRegProject(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs"
                    >
                      Save Borrower
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
              {filteredBorrowers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  No student borrowers found.
                </div>
              ) : (
                filteredBorrowers.map(b => {
                  const isSelected = b.id === currentBorrower?.id;
                  const activeCount = equipment.filter(
                    e =>
                      e.currentLoan &&
                      (e.currentLoan.studentId === b.id ||
                        e.currentLoan.studentName.toLowerCase() === b.name.toLowerCase())
                  ).length;

                  const hasOverdue = equipment.some(
                    e =>
                      e.currentLoan &&
                      (e.currentLoan.studentId === b.id ||
                        e.currentLoan.studentName.toLowerCase() === b.name.toLowerCase()) &&
                      (e.status === 'overdue' || new Date(e.currentLoan.dueDate) < new Date())
                  );

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBorrowerId(b.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {b.name}
                        </p>
                        {activeCount > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              hasOverdue
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {activeCount} active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-0.5 opacity-80 font-mono">
                        <span>{b.id}</span>
                        <span>{b.course.split(':')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: User Rental Details */}
          {currentBorrower ? (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* User Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {currentBorrower.name}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                      {currentBorrower.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {currentBorrower.email}
                    </span>
                    <span>·</span>
                    <span>{currentBorrower.course}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Project Title:</span> {currentBorrower.project}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportUserCsv}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                    title="Export this student's rental history to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                    title="Print student custody receipt"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Receipt</span>
                  </button>

                  {onCheckoutToUser && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCheckoutToUser(currentBorrower);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Check Out Gear</span>
                    </button>
                  )}

                  {/* Remove Borrower Button */}
                  <button
                    type="button"
                    onClick={handleRemoveCurrentBorrower}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                    title={
                      borrowerActiveLoans.length > 0
                        ? `Cannot remove: ${borrowerActiveLoans.length} active equipment item(s) on loan`
                        : `Remove ${currentBorrower.name} from directory`
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Active Rentals Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-indigo-500" />
                    Currently In Custody ({borrowerActiveLoans.length} active assets)
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Under direct student custody agreement
                  </span>
                </div>

                {borrowerActiveLoans.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {borrowerActiveLoans.map(item => {
                      const loan = item.currentLoan!;
                      const isOverdue =
                        item.status === 'overdue' || new Date(loan.dueDate) < new Date();

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isOverdue
                              ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/80'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                {item.category}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.name}
                              </h5>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  isOverdue
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                                }`}
                              >
                                {isOverdue ? 'OVERDUE RETURN' : 'ACTIVE LOAN'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Barcode: {item.barcode}
                              </span>
                              <span>·</span>
                              <span>S/N: {item.serialNumber}</span>
                              <span>·</span>
                              <span>Bay: {item.location}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Checked out:{' '}
                                {new Date(loan.checkoutDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Return Due:{' '}
                                {new Date(loan.dueDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {/* Digital Signature Badge */}
                            {loan.studentSignature && (
                              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Custody signature verified on checkout</span>
                              </div>
                            )}
                          </div>

                          {/* Quick item actions */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {onReturnItem && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onReturnItem(item);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Process Return</span>
                              </button>
                            )}

                            {onReportDamage && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onReportDamage(item);
                                }}
                                className="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg border border-amber-200 dark:border-amber-800"
                              >
                                Damage
                              </button>
                            )}

                            {onPrintQr && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onPrintQr(item);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                                title="Print Tag"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      No Equipment Currently Checked Out
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      All previous loans for {currentBorrower.name} have been returned to the depot bay.
                    </p>
                  </div>
                )}
              </div>

              {/* Past Rental & Return History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-500" />
                  Past Rental & Custody History ({borrowerHistoryLoans.length} returned records)
                </h4>

                {borrowerHistoryLoans.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Equipment</th>
                          <th className="py-2.5 px-3">Barcode</th>
                          <th className="py-2.5 px-3">Borrow Window</th>
                          <th className="py-2.5 px-3">Return Condition</th>
                          <th className="py-2.5 px-3">Staff Witness</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]">
                        {borrowerHistoryLoans.map(l => (
                          <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                              {l.equipmentName}
                            </td>
                            <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">
                              {l.equipmentBarcode}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                              {new Date(l.checkoutDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })} →{' '}
                              {l.returnDate ? new Date(l.returnDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' }) : 'Active'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded capitalize bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                                {l.returnCondition || 'Good'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                              {l.verifiedByStaff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-mono italic">
                    No historical returned loans on file for this student borrower yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a student borrower from the left to view their active rentals and history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
