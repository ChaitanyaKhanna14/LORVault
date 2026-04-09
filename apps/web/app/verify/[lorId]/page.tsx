'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VerificationResult, { VerificationData } from '@/components/VerificationResult';
import { verifyByLorId } from '@/lib/api';

export default function VerifyPage() {
  const params = useParams();
  const lorId = params.lorId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyByLorId(lorId);
        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Failed to verify document');
      } finally {
        setIsLoading(false);
      }
    };

    if (lorId) {
      verify();
    }
  }, [lorId]);

  return (
    <section className="py-12 min-h-[60vh]">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Document Verification
          </h1>
          <p className="text-slate-600">
            LOR ID: <code className="bg-slate-100 px-2 py-1 rounded text-sm">{lorId}</code>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-600 font-medium">Verifying document...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        )}

        {/* Result */}
        {result && (
          <VerificationResult 
            data={result} 
            onVerifyAnother={() => window.location.href = '/'} 
          />
        )}
      </div>
    </section>
  );
}
