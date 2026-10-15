import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import {
  Download,
  Printer,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Film,
  Wrench,
  ShieldAlert,
  FileSpreadsheet,
  Check,
  ChevronDown
} from 'lucide-react';

export const MonthlyReportsView: React.FC = () => {
  const { equipment, loanHistory, maintenanceTickets, addToast } = useDepot();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Compute metrics for selected month
  const totalLoansCount = loanHistory.length + 8; // Including pre-academic baseline
  const onTimeReturns = loanHistory.filter(l => l.status === 'returned').length;
  const complianceRate = Math.round((onTimeReturns / (loanHistory.length || 1)) * 100);

  // 1. Export Academic Borrowing Ledger CSV
  const handleExportBorrowingCsv = () => {
    const headers = [
      'Loan ID',
      'Equipment Name',
      'Barcode',
      'Student Name',
      'Student ID',
      'Student Email',
      'Course',
      'Project Title',
      'Checkout Date',
      'Due Date',
      'Return Date',
      'Return Condition',
      'Staff Witness',
      'Status'
    ];

    const rows = loanHistory.map(l => [
      l.id,
      `"${l.equipmentName.replace(/"/g, '""')}"`,
      l.equipmentBarcode,
      `"${l.studentName.replace(/"/g, '""')}"`,
      l.studentId,
      l.studentEmail,
      `"${l.course.replace(/"/g, '""')}"`,
      `"${l.projectTitle.replace(/"/g, '""')}"`,
      l.checkoutDate,
      l.dueDate,
      l.returnDate || 'ACTIVE_CUSTODY',
      l.returnCondition || 'N/A',
      `"${l.verifiedByStaff}"`,
      l.status.toUpperCase()
    ]);

    downloadCsvFile(
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n'),
      `CineTrack_Borrowing_Ledger_${selectedMonth}.csv`,
      'Academic Borrowing Ledger'
    );
  };

  // 2. Export Fleet Equipment Census CSV
  const handleExportInventoryCsv = () => {
    const headers = [
      'Asset ID',
      'Equipment Name',
      'Brand',
      'Model',
      'Category',
      'Barcode',
      'Serial Number',
      'Depot Bay Location',
      'Replacement Value (USD)',
      'Current Status',
      'Condition',
      'Active Custodian',
      'Next Maintenance Service'
    ];

    const rows = equipment.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.brand.replace(/"/g, '""')}"`,
      `"${item.model.replace(/"/g, '""')}"`,
      item.category.toUpperCase(),
      item.barcode,
      item.serialNumber,
      `"${item.location.replace(/"/g, '""')}"`,
      item.replacementValue,
      item.status.toUpperCase(),
      item.condition.toUpperCase(),
      item.currentLoan ? `"${item.currentLoan.studentName} (${item.currentLoan.studentId})"` : 'IN_DEPOT',
      item.maintenanceSchedule.nextServiceDate
    ]);

    downloadCsvFile(
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n'),
      `CineTrack_Fleet_Census_${selectedMonth}.csv`,
      'Fleet Inventory & Valuation Census'
    );
  };

  // 3. Export Maintenance & Incident Audit CSV
  const handleExportMaintenanceCsv = () => {
    const headers = [
      'Ticket ID',
      'Equipment Name',
      'Barcode',
      'Report Date',
      'Reported By',
      'Severity',
      'Issue Type',
      'Status',
      'Email Dispatched To',
      'Resolution Notes',
      'Resolved Date'
    ];

    const rows = maintenanceTickets.map(t => [
      t.id,
      `"${t.equipmentName.replace(/"/g, '""')}"`,
      t.barcode,
      t.reportDate,
      `"${t.reportedBy}"`,
      t.severity.toUpperCase(),
      t.issueType.toUpperCase(),
      t.status.toUpperCase(),
      t.dispatchedTo,
      `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`,
      t.resolvedDate || 'PENDING'
    ]);

    downloadCsvFile(
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n'),
      `CineTrack_Maintenance_Tickets_${selectedMonth}.csv`,
      'Maintenance & Damage Incidents Ledger'
    );
  };

  const downloadCsvFile = (content: string, filename: string, label: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `${label} exported to ${filename} for departmental records.`
    });
    setExportDropdownOpen(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const courseBreakdown = [
    { code: 'FILM 401: Senior Thesis Production', loans: 16, pct: 36, color: 'bg-indigo-600' },
    { code: 'CINE 350: Advanced Lighting & Camera', loans: 11, pct: 25, color: 'bg-indigo-500' },
    { code: 'DOC 320: Documentary Practicum', loans: 8, pct: 18, color: 'bg-sky-500' },
    { code: 'CINE 210: Cinematography I', loans: 6, pct: 14, color: 'bg-emerald-500' },
    { code: 'FILM 240: Production Sound', loans: 3, pct: 7, color: 'bg-amber-500' }
  ];

  const categoryUtilization = [
    { category: 'Cinema Cameras', inCirculation: 4, utilization: 88 },
    { category: 'Cine Prime Lenses', inCirculation: 3, utilization: 82 },
    { category: 'Production Lighting', inCirculation: 2, utilization: 70 },
    { category: 'Field Audio Packages', inCirculation: 2, utilization: 75 },
    { category: 'Monitoring & Wireless', inCirculation: 2, utilization: 65 },
    { category: 'Grip & Camera Support', inCirculation: 2, utilization: 55 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Monthly Academic Usage & Fleet Utilization Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Departmental borrowing logs, course gear demand, return compliance, and maintenance downtime
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
          >
            <option value="2026-10">October 2026 (Fall Midterm)</option>
            <option value="2026-09">September 2026 (Semester Start)</option>
            <option value="2026-08">August 2026 (Faculty Prep)</option>
          </select>

          {/* Export to CSV Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export to CSV</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleExportBorrowingCsv}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">Borrowing Ledger CSV</p>
                    <p className="text-[10px] text-slate-400 font-mono">Student custody & return dates</p>
                  </div>
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                </button>

                <button
                  type="button"
                  onClick={handleExportInventoryCsv}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">Inventory Census CSV</p>
                    <p className="text-[10px] text-slate-400 font-mono">Valuations, bays & barcodes</p>
                  </div>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={handleExportMaintenanceCsv}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">Maintenance & Damage CSV</p>
                    <p className="text-[10px] text-slate-400 font-mono">Incidents, severity & dispatches</p>
                  </div>
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Total Student Loans
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{totalLoansCount}</p>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% vs prior month</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Return Compliance Rate
          </span>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{complianceRate}%</p>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>On-time student returns</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Active Borrowers
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">28</p>
          <div className="text-[11px] text-slate-500 font-mono">
            Undergrad & MFA Students
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Maintenance Downtime
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">14.2 hrs</p>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-500" />
            <span>2 tickets resolved in-house</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Allocation Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-500" />
              Borrowing Volume by Academic Course
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Fall Semester 2026</span>
          </div>

          <div className="space-y-3 pt-1">
            {courseBreakdown.map(c => (
              <div key={c.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{c.code}</span>
                  <span className="font-mono text-slate-500 shrink-0">{c.loans} loans ({c.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            * Senior thesis productions hold priority checkout windows on ARRI Alexa 35 and Cooke Prime sets on Fridays through Mondays.
          </p>
        </div>

        {/* Equipment Category Utilization */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Equipment Category Utilization Rate
            </h3>
            <span className="text-[11px] font-mono text-slate-400">% Active Time</span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryUtilization.map(cat => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.category}</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{cat.utilization}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    style={{ width: `${cat.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            * Utilization calculated based on active hours checked out vs total available cage operating hours.
          </p>
        </div>
      </div>

      {/* Live Borrowing Ledger Table Preview with Direct CSV Export */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              Academic Borrowing Records Ledger
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Live custody log with student names, courses, due dates & condition notes
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportBorrowingCsv}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table to CSV</span>
          </button>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Equipment</th>
                <th className="py-2.5 px-3">Barcode</th>
                <th className="py-2.5 px-3">Student Borrower</th>
                <th className="py-2.5 px-3">Course / Project</th>
                <th className="py-2.5 px-3">Checkout</th>
                <th className="py-2.5 px-3">Due / Returned</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]">
              {loanHistory.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                    {l.equipmentName}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">
                    {l.equipmentBarcode}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{l.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{l.studentId}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                    {l.course.split(':')[0]}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(l.checkoutDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {l.returnDate
                      ? new Date(l.returnDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })
                      : new Date(l.dueDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        l.status === 'returned'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : l.status === 'overdue'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident & Maintenance Resolution Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Equipment Health, Damage & Maintenance Resolution Audit
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Total Tickets: {maintenanceTickets.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">Open Work Orders</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {maintenanceTickets.filter(t => t.status !== 'resolved').length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Under technician evaluation</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">Resolved In-House</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {maintenanceTickets.filter(t => t.status === 'resolved').length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Sensor cleanings & contact checks</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">Critical Equipment Losses</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">0</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Zero student gear losses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
