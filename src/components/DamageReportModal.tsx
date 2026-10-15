import React, { useState } from 'react';
import { useDepot, EmailPreviewData } from '../context/DepotContext';
import { EquipmentItem } from '../types';
import { AlertTriangle, X, ShieldAlert, Camera, Send, FileWarning, ArrowRight } from 'lucide-react';

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: EquipmentItem | null;
  onEmailDispatched: (emailData: EmailPreviewData) => void;
}

export const DamageReportModal: React.FC<DamageReportModalProps> = ({
  isOpen,
  onClose,
  initialItem,
  onEmailDispatched
}) => {
  const { equipment, reportDamage, role, addToast } = useDepot();

  const [selectedEquipmentId, setSelectedEquipmentId] = useState(initialItem?.id || equipment[0]?.id || '');
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('major');
  const [issueType, setIssueType] = useState<'physical_damage' | 'sensor_dust' | 'electronic_fault' | 'lost_accessory' | 'routine_calibration'>('physical_damage');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState(role === 'manager' ? 'Maya Lin (Cage Supervisor)' : 'Sam Rodriguez (Depot Tech)');
  const [samplePhoto, setSamplePhoto] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEquipment = equipment.find(e => e.id === selectedEquipmentId) || initialItem || equipment[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentId || !description.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Info',
        message: 'Please provide equipment selection and damage description.'
      });
      return;
    }

    const { emailPreview } = reportDamage({
      equipmentId: selectedEquipmentId,
      severity,
      issueType,
      description,
      photoUrl: samplePhoto,
      reportedBy
    });

    onClose();
    onEmailDispatched(emailPreview);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-red-500/10 text-red-950 dark:text-red-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Equipment Damage & Loss Incident Report
              </h2>
              <p className="text-xs text-red-700 dark:text-red-400 font-mono">
                Automated incident dispatch triggers email to film-maintenance@university.edu
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Equipment selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Damaged Equipment Asset *
            </label>
            <select
              value={selectedEquipmentId}
              onChange={e => setSelectedEquipmentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            >
              {equipment.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.barcode} · {item.serialNumber} · {item.status.toUpperCase()})
                </option>
              ))}
            </select>
            {currentEquipment && (
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Replacement Value: ${currentEquipment.replacementValue.toLocaleString()} · Location: {currentEquipment.location}
              </p>
            )}
          </div>

          {/* Severity Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Damage Severity Level *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { val: 'minor', label: 'Minor', desc: 'Cosmetic / Small repair needed', color: 'border-amber-500 text-amber-800 dark:text-amber-300' },
                { val: 'major', label: 'Major', desc: 'Component failure / Optic chip', color: 'border-orange-500 text-orange-800 dark:text-orange-300' },
                { val: 'critical', label: 'Critical / Loss', desc: 'Total inoperability / Lost on set', color: 'border-red-600 text-red-800 dark:text-red-300' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSeverity(opt.val as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    severity === opt.val
                      ? `${opt.color} bg-red-50/50 dark:bg-red-950/20 font-bold ring-2 ring-red-500/30`
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-80">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fault / Failure Classification *
            </label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="physical_damage">Physical Impact / Drop / Chipped Housing</option>
              <option value="sensor_dust">Optical Sensor Glass / Lens Front Element Scratch</option>
              <option value="electronic_fault">Electronic Fault / Power Ballast / Circuit Failure</option>
              <option value="lost_accessory">Missing Accessory / Cable / Rods / Battery Left on Set</option>
              <option value="routine_calibration">Urgent Collimation / Critical Drift</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Narrative & Diagnostic Details *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe exact location of damage, circumstances (e.g. dropped during crane move, cable snagged on doorway), visible symptoms, and immediate bench testing results..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
            />
          </div>

          {/* Sample damage attachments simulator */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              Damage Photo Evidence (Click to attach photographic log):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Scratched Front Element', desc: 'Front optic abrasion' },
                { label: 'Blown SDI 12G Port', desc: 'Burned ESD diode' },
                { label: 'Bent Iris Blade', desc: 'Mechanical resistance' },
                { label: 'Cracked Carbon Arm', desc: 'Structural stress fracture' }
              ].map(sample => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setSamplePhoto(sample.label)}
                  className={`px-2.5 py-1.5 text-[11px] rounded-lg border transition-all ${
                    samplePhoto === sample.label
                      ? 'bg-red-500 text-white border-red-600 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
              {samplePhoto && (
                <button
                  type="button"
                  onClick={() => setSamplePhoto(null)}
                  className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Remove Attachment
                </button>
              )}
            </div>
            {samplePhoto && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                ✓ Photographic evidence attached: [{samplePhoto}.jpg - 4.2MB]
              </p>
            )}
          </div>

          {/* Reporter details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reporting Technician / Inspector
            </label>
            <input
              type="text"
              required
              value={reportedBy}
              onChange={e => setReportedBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-mono">
              Recipients: film-maintenance@university.edu
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Dispatch Automated Alert</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
