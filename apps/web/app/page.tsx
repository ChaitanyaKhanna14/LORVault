'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import QRScanner from '@/components/QRScanner';
import VerificationResult, { VerificationData } from '@/components/VerificationResult';
import HowItWorks from '@/components/HowItWorks';
import { verifyByLorId, verifyByPdfUpload } from '@/lib/api';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'scan'>('upload');

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyByPdfUpload(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (lorId: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyByLorId(lorId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnother = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Verify Letters of Recommendation
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Trust Every Recommendation
          </p>
        </div>
      </section>

      {/* Verification Section */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          {result ? (
            <VerificationResult data={result} onVerifyAnother={handleVerifyAnother} />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload PDF
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('scan')}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === 'scan'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR Code
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'upload' ? (
                  <div className="space-y-4">
                    <p className="text-slate-600 text-sm mb-4">
                      Upload the PDF document you received to verify its authenticity.
                    </p>
                    <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                    {isLoading && (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Verifying document...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <QRScanner onScan={handleQRScan} isLoading={isLoading} />
                )}

                {error && (
                  <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />
    </>
  );
}
