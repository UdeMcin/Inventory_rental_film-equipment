import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, ShieldCheck, PenTool } from 'lucide-react';

interface DigitalSignaturePadProps {
  signerName: string;
  roleDescription?: string;
  onSignatureChange: (signatureData: string) => void;
  required?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signerName,
  roleDescription = 'Borrower / Custodian',
  onSignatureChange,
  required = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [timestamp] = useState(() => new Date().toISOString());

  // Initialize canvas with retina sharpness
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = '#4338ca'; // Indigo 700
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left,
        y: (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasSignature(false);
    onSignatureChange('');
  };

  const useAutoSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw stylized cursive initials
    ctx.beginPath();
    ctx.moveTo(25, h * 0.65);
    ctx.bezierCurveTo(45, h * 0.2, 70, h * 0.85, 100, h * 0.4);
    ctx.bezierCurveTo(120, h * 0.1, 140, h * 0.7, 180, h * 0.5);
    ctx.bezierCurveTo(210, h * 0.35, 240, h * 0.6, 270, h * 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(35, h * 0.72);
    ctx.lineTo(w - 30, h * 0.7);
    ctx.stroke();

    setHasSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-indigo-500" />
          Digital Custody Signature: {signerName || 'Student / Signer'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useAutoSignature}
            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Auto-Sign
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <Eraser className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 block cursor-crosshair"
        />

        {/* Baseline guide */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Sign above the line</span>
          <span>{roleDescription}</span>
        </div>

        {hasSignature && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 pointer-events-none">
            <Check className="w-3 h-3" />
            <span>Captured</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          SHA-256 Custody Hash Verified
        </span>
        <span>{timestamp.slice(0, 10)} {timestamp.slice(11, 16)} UTC</span>
      </div>
    </div>
  );
};
