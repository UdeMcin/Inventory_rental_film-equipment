import React, { useState } from 'react';
import { useDepot, EmailPreviewData } from '../context/DepotContext';
import { EquipmentItem, MaintenanceTicket } from '../types';
import { Wrench, ShieldAlert, CheckCircle2, Clock, Mail, Plus, Check, ArrowRight } from 'lucide-react';

interface MaintenanceViewProps {
  onSelectItem: (item: EquipmentItem) => void;
  onOpenDamageReport: () => void;
  onInspectEmail: (data: EmailPreviewData) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onSelectItem,
  onOpenDamageReport,
  onInspectEmail
}) => {
  const { equipment, maintenanceTickets, resolveTicket, role, addToast } = useDepot();

  const [activeTab, setActiveTab] = useState<'tickets' | 'schedules'>('tickets');
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const openTickets = maintenanceTickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = maintenanceTickets.filter(t => t.status === 'resolved');

  const handleResolveSubmit = (ticketId: string) => {
    if (!resolutionNotes.trim()) {
      addToast({
        type: 'warning',
        title: 'Notes Required',
        message: 'Please provide technician notes on what repair or calibration was performed.'
      });
      return;
    }
    resolveTicket(ticketId, resolutionNotes);
    setResolvingTicketId(null);
    setResolutionNotes('');
  };

  const handleViewEmail = (t: MaintenanceTicket) => {
    const item = equipment.find(e => e.id === t.equipmentId);
    onInspectEmail({
      recipient: t.dispatchedTo,
      sender: `${t.reportedBy} <cage-dispatch@university.edu>`,
      subject: `[CINETRACK DISPATCH] ${t.severity.toUpperCase()} Damage: ${t.equipmentName}`,
      equipmentName: t.equipmentName,
      barcode: t.barcode,
      serialNumber: item?.serialNumber || 'N/A',
      severity: t.severity,
      description: t.description,
      reportedBy: t.reportedBy,
      timestamp: new Date(t.reportDate).toLocaleString(),
      ticketId: t.id
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            Equipment Maintenance & Preventative Calibration
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Optical collimator tests, sensor purges, automated repair dispatches & bench tickets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDamageReport}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report Damage / Defect</span>
          </button>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`py-2.5 border-b-2 -mb-[1px] transition-colors ${
            activeTab === 'tickets'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Incident Tickets ({openTickets.length} Open)
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`py-2.5 border-b-2 -mb-[1px] transition-colors ${
            activeTab === 'schedules'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Preventative Calibration Schedules ({equipment.length})
        </button>
      </div>

      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Active Work Orders */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Active Service & Damage Tickets:
            </h3>

            {openTickets.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Zero Open Work Orders</p>
                <p className="text-[11px] text-slate-400">All film depot equipment is calibrated and operational.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          ticket.severity === 'critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : ticket.severity === 'major'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {ticket.severity} SEVERITY
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {ticket.id}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {ticket.equipmentName} ({ticket.barcode})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ticket.emailDispatched && (
                          <button
                            type="button"
                            onClick={() => handleViewEmail(ticket)}
                            className="px-2 py-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded border border-indigo-200 dark:border-indigo-800 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>View Dispatched Email</span>
                          </button>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          Reported: {new Date(ticket.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                        Defect Diagnosis ({ticket.issueType.replace('_', ' ')}):
                      </span>
                      {ticket.description}
                    </div>

                    {resolvingTicketId === ticket.id ? (
                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                        <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                          Bench Resolution & Certification Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={resolutionNotes}
                          onChange={e => setResolutionNotes(e.target.value)}
                          placeholder="e.g. Optical sensor swabbed with Eclipse solution; lens bench collimated; retested clean at f/22..."
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setResolvingTicketId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveSubmit(ticket.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Certify Repaired & Restock Asset</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Tech: {ticket.reportedBy}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResolvingTicketId(ticket.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Close Ticket / Mark Resolved</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved History */}
          {resolvedTickets.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Recently Resolved Work Orders:
              </h3>
              <div className="space-y-2">
                {resolvedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white">{ticket.equipmentName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{ticket.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 ml-6">
                        Resolution: {ticket.resolutionNotes || 'Routine calibration completed.'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 self-end sm:self-center">
                      Resolved {ticket.resolvedDate?.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Equipment Asset</th>
                  <th className="py-3 px-4 font-semibold">Tag Barcode</th>
                  <th className="py-3 px-4 font-semibold">Last Serviced</th>
                  <th className="py-3 px-4 font-semibold">Next Calibration Due</th>
                  <th className="py-3 px-4 font-semibold">Procedure Scope</th>
                  <th className="py-3 px-4 font-semibold">Assigned Tech</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {equipment.map(item => {
                  const isUpcoming = new Date(item.maintenanceSchedule.nextServiceDate) <= new Date(Date.now() + 7 * 86400000);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                        {item.barcode}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {item.maintenanceSchedule.lastServicedDate}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={isUpcoming ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {item.maintenanceSchedule.nextServiceDate}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        {item.maintenanceSchedule.serviceType}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.maintenanceSchedule.technician}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onSelectItem(item);
                          }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
