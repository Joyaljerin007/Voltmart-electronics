import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { QrCode, X, Camera, Search, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const { isScannerOpen, setIsScannerOpen, openProductDetail, showToast } = useStore();
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  if (!isScannerOpen) return null;

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup.trim()) return;
    setLoading(true);
    setLookupError(null);

    const res = await api.lookupBarcode(codeToLookup.trim());
    setLoading(false);

    if (res.success && res.data) {
      showToast(`Scanned: ${res.data.name}`, 'success');
      setIsScannerOpen(false);
      openProductDetail(res.data.id);
    } else {
      setLookupError(`No product found matching code "${codeToLookup}". Try one of the test barcodes below.`);
    }
  };

  const sampleBarcodes = [
    { code: '190199438210', label: 'MacBook Pro 16" (M3 Max)' },
    { code: '887276801923', label: 'Galaxy S24 Ultra (512GB)' },
    { code: '027242923989', label: 'Sony WH-1000XM5 ANC' },
    { code: '887276774129', label: 'Samsung Odyssey OLED G9 49"' },
    { code: '812674026885', label: 'NVIDIA RTX 4090 24GB' },
    { code: '195949129038', label: 'Apple Watch Ultra 2' },
  ];

  return (
    <div id="scanner-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Barcode & QR Scanner</h3>
              <p className="text-xs text-slate-400">Scan product packaging or enter UPC/SKU</p>
            </div>
          </div>
          <button
            onClick={() => setIsScannerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewfinder Simulation */}
        <div className="p-6 space-y-6">
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center p-4 shadow-inner">
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
            
            {/* Viewfinder Target Reticle */}
            <div className="w-48 h-32 border-2 border-dashed border-emerald-500/50 rounded-lg flex items-center justify-center relative bg-emerald-500/5">
              <Camera className="w-8 h-8 text-emerald-400/80 mb-1" />
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Optical barcode scan engine ready • Point camera at standard UPC / EAN-13
            </p>
          </div>

          {/* Manual Code Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(manualCode);
            }}
            className="space-y-2"
          >
            <label className="text-xs font-semibold text-slate-300 block">
              Enter Barcode, UPC, or SKU directly:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. 190199438210 or APP-MBP16-M3MAX"
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white font-mono rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
              >
                {loading ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
          </form>

          {lookupError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Quick Demo Test Barcode Chips */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Test with Seed Barcodes (Click to simulate scan)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleLookup(item.code)}
                  className="text-left p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300">
                    Code: {item.code}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
