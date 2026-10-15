import React, { useState } from 'react';
import { EmailPreviewData } from '../context/DepotContext';
import { Mail, Copy, Check, X, ShieldAlert, ArrowUpRight, Send, Printer } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: EmailPreviewData | null;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  emailData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !emailData) return null;

  const copyEmailText = () => {
    const text = `
To: ${emailData.recipient}
From: ${emailData.sender}
Subject: ${emailData.subject}
Date: ${emailData.timestamp}
Ticket ID: ${emailData.ticketId}

EQUIPMENT INCIDENT REPORT:
------------------------------------------
Equipment Name: ${emailData.equipmentName}
Depot Barcode Tag: ${emailData.barcode}
Serial Number: ${emailData.serialNumber}
Severity: ${emailData.severity.toUpperCase()}
Reported By: ${emailData.reportedBy}

INCIDENT / DAMAGE DESCRIPTION:
${emailData.description}

STATUS:
Equipment has been locked in depot custody and marked "Under Repair / In Maintenance" in CineTrack Pro.
------------------------------------------
University Film Studies Equipment Depot
Autonomous Notification Dispatcher
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Email Client Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">Automated Email Dispatch Service</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  DISPATCHED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Routed to University Facilities & Cine Maintenance Queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2 font-mono">
          <div className="flex">
            <span className="w-20 text-slate-500 dark:text-slate-400">To:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{emailData.recipient}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-slate-500 dark:text-slate-400">From:</span>
            <span className="text-slate-700 dark:text-slate-300">{emailData.sender}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-slate-500 dark:text-slate-400">Subject:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{emailData.subject}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-slate-500 dark:text-slate-400">Sent:</span>
            <span className="text-slate-600 dark:text-slate-400">{emailData.timestamp}</span>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>INCIDENT PRIORITY: {emailData.severity.toUpperCase()}</span>
            </div>
            <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed">
              An equipment damage/loss event was just recorded at the Film Studies Cage. The asset has been pulled from circulation and locked in the service bay awaiting bench diagnostic and repair.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
              Equipment Specifications & Chain of Custody:
            </h4>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Item Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{emailData.equipmentName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Depot Tag Barcode:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{emailData.barcode}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Serial Number:</span>
                <span className="text-slate-800 dark:text-slate-200">{emailData.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Maintenance Work Order:</span>
                <span className="text-slate-800 dark:text-slate-200">{emailData.ticketId}</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono pt-2">
              Damage Description & Technician Notes:
            </h4>
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {emailData.description}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-500" />
            <span>Delivered via University SMTP Relay</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyEmailText}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Email Body'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
