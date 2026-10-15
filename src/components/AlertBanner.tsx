import React from 'react';
import { useDepot } from '../context/DepotContext';
import { AlertTriangle, Wrench, ArrowRight, BellRing } from 'lucide-react';
import { EquipmentItem } from '../types';

interface AlertBannerProps {
  onSelectItem: (item: EquipmentItem, action?: 'return' | 'detail') => void;
  onOpenMaintenanceTab: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  onSelectItem,
  onOpenMaintenanceTab
}) => {
  const { overdueItems, upcomingServiceItems, addToast } = useDepot();

  if (overdueItems.length === 0 && upcomingServiceItems.length === 0) {
    return null;
  }

  const handleSendReminder = (e: React.MouseEvent, item: EquipmentItem) => {
    e.stopPropagation();
    addToast({
      type: 'info',
      title: 'Automated Return Notice Sent',
      message: `SMS & University Email alert dispatched to ${item.currentLoan?.studentName} (${item.currentLoan?.studentEmail}).`
    });
  };

  return (
    <div className="space-y-2 mb-6">
      {/* Overdue Alerts */}
      {overdueItems.map(item => (
        <div
          key={item.id}
          className="p-3.5 rounded-xl border border-red-300/80 bg-red-500/10 dark:border-red-800/80 dark:bg-red-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-900 dark:text-red-300 uppercase font-mono tracking-wider text-[11px]">
                  Overdue Equipment Alert
                </span>
                <span className="text-[10px] font-mono text-red-700 dark:text-red-400">
                  Tag: {item.barcode}
                </span>
              </div>
              <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">
                {item.name} is past scheduled class return time!
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Borrower: <span className="font-medium text-slate-800 dark:text-slate-200">{item.currentLoan?.studentName}</span> ({item.currentLoan?.course}) · Scheduled Due:{' '}
                <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                  {item.currentLoan ? new Date(item.currentLoan.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={e => handleSendReminder(e, item)}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Send Student Alert</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectItem(item, 'return')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Process Return</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Upcoming Preventative Service Countdown Alert */}
      {upcomingServiceItems.length > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-300/80 bg-amber-500/10 dark:border-amber-800/80 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-300 uppercase font-mono tracking-wider text-[11px]">
                Upcoming Preventative Service Alert ({upcomingServiceItems.length} Asset{upcomingServiceItems.length > 1 ? 's' : ''})
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                {upcomingServiceItems[0].name} is due for calibration on{' '}
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {upcomingServiceItems[0].maintenanceSchedule.nextServiceDate}
                </span>
                {upcomingServiceItems.length > 1 && ` (+${upcomingServiceItems.length - 1} more)`}
              </p>
              <p className="text-slate-500 text-[11px]">
                Procedure: {upcomingServiceItems[0].maintenanceSchedule.serviceType}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMaintenanceTab}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 shrink-0 self-end sm:self-center"
          >
            <span>View Service Schedules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
