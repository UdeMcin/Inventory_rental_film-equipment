import React, { useState, useEffect, useRef } from 'react';
import { useDepot } from '../context/DepotContext';
import { Camera, RefreshCw, X, Search, Check, AlertCircle, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { playScanSuccessTone, playAlertWarningTone } from '../utils/audio';
import { EquipmentItem } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: EquipmentItem, suggestedAction?: 'checkout' | 'return' | 'damage' | 'detail') => void;
  onOpenAiRecognition?: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  onOpenAiRecognition
}) => {
  const { equipment } = useDepot();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [detectedItem, setDetectedItem] = useState<EquipmentItem | null>(null);
  const [scanHistory, setScanHistory] = useState<{ item: EquipmentItem; time: string }[]>([]);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Initialize camera
  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let animId: number;

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available in this browser environment');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasCamera(true);
        }
      } catch (err: any) {
        setCameraError(err.message || 'Camera access not granted or unavailable. Manual entry and quick test presets are active.');
        setHasCamera(false);
      }
    };

    startCamera();

    // Barcode detection interval loop
    const scanLoop = async () => {
      if (videoRef.current && isScanningActive && (window as any).BarcodeDetector) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'qr_code', 'ean_13']
          });
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            handleBarcodeFound(rawVal);
          }
        } catch {
          // Ignore loop errors
        }
      }
      animId = requestAnimationFrame(scanLoop);
    };

    animId = requestAnimationFrame(scanLoop);

    return () => {
      cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, isScanningActive]);

  const handleBarcodeFound = (code: string) => {
    const clean = code.trim().toUpperCase();
    const matched = equipment.find(
      e => e.barcode.toUpperCase() === clean || e.serialNumber.toUpperCase() === clean || e.id.toUpperCase() === clean
    );

    if (matched) {
      playScanSuccessTone();
      setDetectedItem(matched);
      setScanHistory(prev => [{ item: matched, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 7)]);
    } else {
      playAlertWarningTone();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeFound(manualCode);
  };

  const handleSimulatedScan = (item: EquipmentItem) => {
    playScanSuccessTone();
    setDetectedItem(item);
    setScanHistory(prev => [{ item, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 7)]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              Depot Barcode & Asset Scanner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aim camera at asset tag or enter barcode serial number
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAiRecognition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiRecognition();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                title="Switch to AI Photo Recognition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Photo Vision</span>
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

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scanner Viewport */}
          <div className="relative w-full h-56 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {hasCamera ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 max-w-sm">
                  {cameraError || 'Camera inactive or permission pending. Use the quick presets or manual barcode input below.'}
                </p>
              </div>
            )}

            {/* Target reticle overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-28 border-2 border-indigo-400/80 rounded-lg relative">
                {/* Reticle corner markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-400 -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-400 -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400 -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-400 -mb-0.5 -mr-0.5" />
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-md">
              <span>Sensor: 1280x720 30FPS</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Awaiting Tag
              </span>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Enter Barcode or Serial (e.g. BC-109283, ARRI-35, BC-109284)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Verify Tag
            </button>
          </form>

          {/* Quick Hardware Simulator Test Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Quick Hardware Scanner Presets (Click to Simulate Scan):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {equipment.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSimulatedScan(item)}
                  className="flex items-center justify-between p-2.5 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{item.barcode} · {item.location}</p>
                  </div>
                  <span className={`text-[10px] font-mono shrink-0 uppercase ${
                    item.status === 'available'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.status === 'overdue'
                      ? 'text-red-600 dark:text-red-400 font-bold'
                      : item.status === 'checked_out'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detected Item Action Card */}
          {detectedItem && (
            <div className="p-4 border-2 border-indigo-500/40 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider">
                    Target Verified: {detectedItem.category.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{detectedItem.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Barcode: {detectedItem.barcode} · Serial: {detectedItem.serialNumber} · {detectedItem.location}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  detectedItem.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : detectedItem.status === 'overdue'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : detectedItem.status === 'checked_out'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  Status: {detectedItem.status.toUpperCase()}
                </span>
              </div>

              {detectedItem.currentLoan && (
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Custodian:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{detectedItem.currentLoan.studentName} ({detectedItem.currentLoan.studentId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course / Project:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{detectedItem.currentLoan.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Deadline:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {new Date(detectedItem.currentLoan.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {detectedItem.status === 'available' && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(detectedItem, 'checkout');
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Check Out to Student</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {(detectedItem.status === 'checked_out' || detectedItem.status === 'overdue') && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(detectedItem, 'return');
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Process Return & Inspect</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectItem(detectedItem, 'damage');
                    onClose();
                  }}
                  className="py-2 px-3 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/60"
                >
                  Report Damage
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectItem(detectedItem, 'detail');
                    onClose();
                  }}
                  className="py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  View File
                </button>
              </div>
            </div>
          )}

          {/* Recent scan trail */}
          {scanHistory.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Recent Scans This Session:
              </span>
              <div className="space-y-1">
                {scanHistory.map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => setDetectedItem(h.item)}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-mono"
                  >
                    <span className="text-slate-800 dark:text-slate-200 truncate">{h.item.name}</span>
                    <span className="text-slate-400 shrink-0 ml-2">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
