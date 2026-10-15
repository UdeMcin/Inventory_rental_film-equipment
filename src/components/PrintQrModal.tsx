import React, { useState } from 'react';
import { EquipmentItem, EquipmentGroup } from '../types';
import { generateQrSvgPath } from '../utils/qrcode';
import { generateBarcodeSvgLines } from '../utils/barcode';
import { X, Printer, QrCode, Tag, Check, Layers } from 'lucide-react';

interface PrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: EquipmentItem[];
  group?: EquipmentGroup | null;
  selectedItemId?: string;
}

export const PrintQrModal: React.FC<PrintQrModalProps> = ({
  isOpen,
  onClose,
  items,
  group,
  selectedItemId
}) => {
  const [printMode, setPrintMode] = useState<'single' | 'all' | 'group'>(
    group ? 'group' : selectedItemId ? 'single' : 'all'
  );
  const [targetItemId, setTargetItemId] = useState<string>(selectedItemId || items[0]?.id || '');
  const [labelSize, setLabelSize] = useState<'standard' | 'case'>('standard');

  if (!isOpen) return null;

  const targetItem = items.find(i => i.id === targetItemId) || items[0];

  const itemsToPrint: EquipmentItem[] =
    printMode === 'single'
      ? targetItem ? [targetItem] : []
      : printMode === 'group' && group
      ? items.filter(i => group.itemIds.includes(i.id))
      : items;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Printable QR Code & Barcode Asset Labels
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Generate high-resolution scannable thermal/sticker labels for camera cases & gear
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

        {/* Controls Toolbar (hidden in print) */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[11px]">Print Scope:</span>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  printMode === 'single'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Single Item
              </button>
              {group && (
                <button
                  type="button"
                  onClick={() => setPrintMode('group')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    printMode === 'group'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Kit Group ({itemsToPrint.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setPrintMode('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  printMode === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                All Fleet ({items.length})
              </button>
            </div>
          </div>

          {printMode === 'single' && (
            <select
              value={targetItemId}
              onChange={e => setTargetItemId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono max-w-xs"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.barcode})
                </option>
              ))}
            </select>
          )}

          {/* Label size format */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[11px]">Label Size:</span>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setLabelSize('standard')}
                className={`px-2.5 py-1 rounded-md text-[11px] ${labelSize === 'standard' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-500'}`}
              >
                2.5" × 1.5" (Standard)
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('case')}
                className={`px-2.5 py-1 rounded-md text-[11px] ${labelSize === 'case' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-500'}`}
              >
                3.5" × 2.5" (Flight Case)
              </button>
            </div>
          </div>
        </div>

        {/* Printable Labels Canvas */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 print:max-h-none print:overflow-visible print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
            {itemsToPrint.map(item => {
              const qrPath = generateQrSvgPath(item.barcode, 4);
              const barcodeLines = generateBarcodeSvgLines(item.barcode);

              return (
                <div
                  key={item.id}
                  className={`border-2 border-slate-900 bg-white text-slate-950 p-4 rounded-xl shadow-xs space-y-3 font-sans print:border-2 print:border-black print:rounded-none print:break-inside-avoid ${
                    labelSize === 'case' ? 'p-5' : 'p-3.5'
                  }`}
                >
                  {/* Label Header */}
                  <div className="border-b border-slate-900 pb-1.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest block text-slate-800">
                        UNIVERSITY FILM STUDIES DEPOT
                      </span>
                      <span className="text-[9px] font-mono text-slate-600">
                        EQUIPMENT CUSTODY & ASSET TRACKING
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-950 text-white rounded">
                      {item.category}
                    </span>
                  </div>

                  {/* Main Label Body: QR Code + Text Details */}
                  <div className="flex items-center gap-3">
                    {/* High-Contrast SVG QR Code */}
                    <div className="bg-white p-1 border border-slate-900 shrink-0">
                      <svg width="88" height="88" viewBox="0 0 88 88" className="block">
                        <rect width="88" height="88" fill="#ffffff" />
                        <path d={qrPath} fill="#000000" />
                      </svg>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-xs leading-tight line-clamp-2 text-slate-950">
                        {item.name}
                      </h3>
                      <div className="text-[11px] font-mono space-y-0.5 text-slate-800">
                        <p className="font-bold text-sm tracking-tight text-indigo-900">
                          {item.barcode}
                        </p>
                        <p className="text-[10px] text-slate-600 truncate">
                          S/N: {item.serialNumber}
                        </p>
                        <p className="text-[10px] text-slate-600">
                          Location: <span className="font-semibold">{item.location}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Linear Barcode Strip at bottom */}
                  <div className="pt-1.5 border-t border-dashed border-slate-400 flex items-center justify-between text-[9px] font-mono text-slate-600">
                    <div>
                      <svg width="120" height="20" className="block">
                        {barcodeLines.map((line, idx) => (
                          <rect key={idx} x={line.x * 0.7} y="0" width={line.width} height="18" fill="#000000" />
                        ))}
                      </svg>
                    </div>
                    <span className="text-right">Scan with CineTrack Pro Scanner</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
          <p className="text-xs text-slate-500 font-mono">
            {itemsToPrint.length} label(s) prepared for thermal or laser sticker printing
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {itemsToPrint.length} Label{itemsToPrint.length > 1 ? 's' : ''} Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
