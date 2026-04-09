'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (lorId: string) => void;
  isLoading?: boolean;
}

export default function QRScanner({ onScan, isLoading }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLorId, setManualLorId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    if (!containerRef.current) return;
    
    setError(null);
    
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Extract LOR ID from URL if it's a full URL
          let lorId = decodedText;
          
          // Check if it's a verification URL
          const verifyMatch = decodedText.match(/\/verify\/([a-zA-Z0-9-]+)/);
          if (verifyMatch) {
            lorId = verifyMatch[1];
          }
          
          // Also check for api/verify URL pattern
          const apiMatch = decodedText.match(/\/api\/verify\/([a-zA-Z0-9-]+)/);
          if (apiMatch) {
            lorId = apiMatch[1];
          }

          stopScanning();
          onScan(lorId);
        },
        () => {
          // QR code not detected - ignore
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setError('Could not access camera. Please allow camera permissions or enter LOR ID manually.');
      setShowManualInput(true);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLorId.trim()) {
      onScan(manualLorId.trim());
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* QR Scanner Section */}
      {!showManualInput && (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Point your camera at the QR code on the document to verify instantly.
          </p>

          {/* Scanner Container */}
          <div 
            ref={containerRef}
            className="relative bg-slate-900 rounded-xl overflow-hidden"
            style={{ minHeight: '300px' }}
          >
            {!isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <button
                  onClick={startScanning}
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div id="qr-reader" className="w-full" />
            )}
          </div>

          {/* Stop Scanning Button */}
          {isScanning && (
            <button
              onClick={stopScanning}
              className="w-full py-2 text-slate-600 hover:text-slate-800 text-sm transition-colors"
            >
              Stop Scanning
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
              {error}
            </div>
          )}

          {/* Fallback Link */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <button
              onClick={() => {
                stopScanning();
                setShowManualInput(true);
              }}
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              Can't scan? <span className="underline">Enter LOR ID manually</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Section (Fallback) */}
      {showManualInput && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowManualInput(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-slate-500">Back to QR Scanner</span>
          </div>

          <p className="text-slate-600 text-sm">
            Enter the LOR ID printed on the document.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={manualLorId}
                onChange={(e) => setManualLorId(e.target.value)}
                placeholder="e.g., abc123-def456-ghi789"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-slate-500">
                The LOR ID is printed at the bottom of the document near the QR code.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={!manualLorId.trim() || isLoading}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Document'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
