import React, { useState, useRef } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentCategory, EquipmentCondition, EquipmentItem } from '../types';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Table,
  CheckCircle2,
  Trash2,
  Layers
} from 'lucide-react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedEquipmentDraft {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: EquipmentCategory;
  barcode: string;
  serialNumber: string;
  location: string;
  replacementValue: number;
  condition: EquipmentCondition;
  eligibleCourses: string[];
  specs: Record<string, string>;
  selected: boolean;
}

const SAMPLE_CSV_DATA = `Name,Brand,Model,Category,Barcode,SerialNumber,Location,ReplacementValue,Condition,EligibleCourses,Specs
Canon EOS C300 Mark III,Canon,C300 Mk III,camera,BC-501923,CAN-C300-9921,Vault Bay B-02,10999,pristine,CINE 210; FILM 401,Sensor:Super 35 DGO; Mount:EF Mount; Codec:Cinema RAW Light
Angenieux EZ-1 30-90mm T2.0 Cine Zoom,Angenieux,EZ-1 30-90mm,lens,BC-501924,ANG-EZ1-4412,Lens Safe 2,12500,good,FILM 401; CINE 350,Aperture:T2.0; Coverage:Super 35; Mount:PL Mount
Kino Flo 4Bank DMX Fluorescent System,Kino Flo,4Bank 4ft,lighting,BC-501925,KINO-4B-8831,Lighting Bay C-1,1450,good,CINE 350; DOC 320,Tubes:4x True Match 5500K; Ballast:Universal 100-240V
Rycote Super-Shield Shotgun Kit,Rycote,Super-Shield Med,audio,BC-501926,RYC-SS-1192,Audio Locker A-2,420,pristine,FILM 240; DOC 220,Windshield:Synthetic Fur Jammer; Mount:Lyre Isolation
Matthews 40" C-Stand with Grip Head & Arm,Matthews,Hollywood 40",grip,BC-501927,MAT-CS-3381,Grip Cage G-1,280,good,CINE 210; CINE 350; FILM 401,Riser:3-Section Steel; Finish:Chrome; Arm:40-inch standard`;

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose }) => {
  const { importEquipmentBatch, addToast } = useDepot();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedEquipmentDraft[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate downloadable sample CSV template
  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinetrack_asset_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'CSV Template Downloaded',
      message: 'cinetrack_asset_import_template.csv ready for spreadsheet editing.'
    });
  };

  const parseCsvString = (text: string) => {
    setParseError(null);
    try {
      const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and 1 data row.');
      }

      // Parse header row
      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));

      // Header column indexes
      const findCol = (keys: string[]) => {
        return headers.findIndex(h => keys.some(k => h === k || h.includes(k)));
      };

      const nameIdx = findCol(['name', 'itemname', 'assetname', 'title', 'equipment', 'description']);
      const brandIdx = findCol(['brand', 'manufacturer', 'make']);
      const modelIdx = findCol(['model', 'modelno', 'modelnumber']);
      const catIdx = findCol(['category', 'type', 'assettype']);
      const barcodeIdx = findCol(['barcode', 'tag', 'assettag', 'qrcode', 'id']);
      const serialIdx = findCol(['serial', 'serialnumber', 'serialno', 'sn']);
      const locIdx = findCol(['location', 'bay', 'depotbay', 'locker', 'bin', 'shelf']);
      const valIdx = findCol(['replacementvalue', 'value', 'price', 'cost']);
      const condIdx = findCol(['condition', 'status', 'health']);
      const coursesIdx = findCol(['eligiblecourses', 'courses', 'course', 'classes']);
      const specsIdx = findCol(['specs', 'specifications', 'notes', 'techspecs']);

      if (nameIdx === -1) {
        throw new Error('Required column "Name" or "Asset Name" not found in CSV header.');
      }

      const results: ParsedEquipmentDraft[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        if (row.length === 0 || row.every(cell => !cell.trim())) continue;

        const rawName = row[nameIdx] || `Equipment Asset #${i}`;
        const rawBrand = (brandIdx !== -1 && row[brandIdx]) ? row[brandIdx] : 'Studio Gear';
        const rawModel = (modelIdx !== -1 && row[modelIdx]) ? row[modelIdx] : rawName;
        
        let rawCat: EquipmentCategory = 'camera';
        if (catIdx !== -1 && row[catIdx]) {
          const c = row[catIdx].toLowerCase();
          if (c.includes('lens') || c.includes('optic')) rawCat = 'lens';
          else if (c.includes('light') || c.includes('led') || c.includes('tube')) rawCat = 'lighting';
          else if (c.includes('audio') || c.includes('sound') || c.includes('mic') || c.includes('recorder')) rawCat = 'audio';
          else if (c.includes('monitor') || c.includes('display') || c.includes('wireless') || c.includes('video')) rawCat = 'monitoring';
          else if (c.includes('grip') || c.includes('stand') || c.includes('tripod') || c.includes('rig') || c.includes('gimbal')) rawCat = 'grip';
          else rawCat = 'camera';
        }

        const rawBarcode = (barcodeIdx !== -1 && row[barcodeIdx]?.trim())
          ? row[barcodeIdx].trim().toUpperCase()
          : `BC-${Math.floor(100000 + Math.random() * 900000)}`;

        const rawSerial = (serialIdx !== -1 && row[serialIdx]?.trim())
          ? row[serialIdx].trim()
          : `SN-${rawBrand.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;

        const rawLoc = (locIdx !== -1 && row[locIdx]?.trim())
          ? row[locIdx].trim()
          : 'Depot Vault Bay B-01';

        const rawVal = (valIdx !== -1 && row[valIdx])
          ? Math.max(0, parseInt(row[valIdx].replace(/[^0-9.]/g, ''), 10) || 1500)
          : 1500;

        let rawCond: EquipmentCondition = 'pristine';
        if (condIdx !== -1 && row[condIdx]) {
          const c = row[condIdx].toLowerCase();
          if (c.includes('good')) rawCond = 'good';
          else if (c.includes('fair')) rawCond = 'fair';
          else if (c.includes('service') || c.includes('repair') || c.includes('damaged')) rawCond = 'needs_service';
        }

        let eligibleCourses = ['FILM 401', 'CINE 350'];
        if (coursesIdx !== -1 && row[coursesIdx]?.trim()) {
          eligibleCourses = row[coursesIdx]
            .split(/[;,|/]+/)
            .map(s => s.trim())
            .filter(Boolean);
        }

        const specs: Record<string, string> = {};
        if (specsIdx !== -1 && row[specsIdx]?.trim()) {
          row[specsIdx].split(/[;,]+/).forEach(part => {
            const [k, v] = part.split(':').map(s => s.trim());
            if (k && v) specs[k] = v;
          });
        }
        if (Object.keys(specs).length === 0) {
          specs['Import Source'] = 'Migrated from external CSV ledger';
          specs['Catalog Verified'] = 'Yes';
        }

        results.push({
          id: `draft-${i}`,
          name: rawName,
          brand: rawBrand,
          model: rawModel,
          category: rawCat,
          barcode: rawBarcode,
          serialNumber: rawSerial,
          location: rawLoc,
          replacementValue: rawVal,
          condition: rawCond,
          eligibleCourses,
          specs,
          selected: true
        });
      }

      setParsedItems(results);
      addToast({
        type: 'success',
        title: 'CSV File Parsed Successfully',
        message: `Parsed ${results.length} equipment items ready for depot import.`
      });
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse CSV file. Please check column format.');
    }
  };

  // Helper for CSV row splitting with quotes handling
  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setRawText(content);
      parseCsvString(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setRawText(content);
        parseCsvString(content);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_CSV_DATA);
    parseCsvString(SAMPLE_CSV_DATA);
  };

  const toggleSelectAll = (checked: boolean) => {
    setParsedItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const toggleItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCommitImport = () => {
    const itemsToImport = parsedItems.filter(i => i.selected);
    if (itemsToImport.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Assets Selected',
        message: 'Please check at least one asset row to import into depot inventory.'
      });
      return;
    }

    const payload = itemsToImport.map(item => ({
      name: item.name,
      brand: item.brand,
      model: item.model,
      category: item.category,
      barcode: item.barcode,
      serialNumber: item.serialNumber,
      location: item.location,
      replacementValue: item.replacementValue,
      condition: item.condition,
      eligibleCourses: item.eligibleCourses,
      specs: item.specs,
      maintenanceSchedule: {
        lastServicedDate: new Date().toISOString().split('T')[0],
        nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        serviceType: 'Initial Intake Calibration & Firmware Inspection',
        intervalDays: 60,
        technician: 'Depot Intake Staff',
        notes: 'Asset imported via legacy CSV migration.'
      }
    }));

    importEquipmentBatch(payload);
    onClose();
  };

  const selectedCount = parsedItems.filter(i => i.selected).length;
  const totalValuation = parsedItems
    .filter(i => i.selected)
    .reduce((sum, i) => sum + i.replacementValue, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Assets from CSV Ledger
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Migrate equipment from Excel, Google Sheets, or previous rental databases
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Info & Sample Template Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Supported File Type: .csv (Comma-Separated Values)
              </span>
              <p className="text-[11px] text-slate-500">
                Auto-maps columns: Name, Brand, Model, Category, Barcode, Serial, Bay, Valuation, Courses, Specs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Download Sample Template</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/30 dark:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Drag and drop your equipment CSV here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports standard CSV exported from Cheqroom, Asset Tiger, EZOfficeInventory, Excel, or Google Sheets
            </p>
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Draft Table Preview */}
          {parsedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-500" />
                    Parsed Equipment Staging Ledger ({parsedItems.length} records found)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    · ${totalValuation.toLocaleString()} fleet value
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                  >
                    Select All
                  </button>
                  <span className="text-slate-400">·</span>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(false)}
                    className="text-slate-500 hover:underline text-[11px]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedItems.length && parsedItems.length > 0}
                          onChange={e => toggleSelectAll(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="py-2 px-3">Equipment / Brand</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Barcode Tag</th>
                      <th className="py-2 px-3">Serial No</th>
                      <th className="py-2 px-3">Depot Bay</th>
                      <th className="py-2 px-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {parsedItems.map(item => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.selected ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : 'opacity-60'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(item.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.brand} · {item.model}
                          </p>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {item.barcode}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {item.serialNumber}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                          {item.location}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          ${item.replacementValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 font-mono">
            {selectedCount} of {parsedItems.length} asset{parsedItems.length !== 1 ? 's' : ''} queued for import
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommitImport}
              disabled={selectedCount === 0}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                selectedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Import {selectedCount} Assets into Depot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
