'use client';

import { useState } from 'react';

interface LorIdInputProps {
  onSubmit: (lorId: string) => void;
  isLoading?: boolean;
}

export default function LorIdInput({ onSubmit, isLoading }: LorIdInputProps) {
  const [lorId, setLorId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lorId.trim()) {
      onSubmit(lorId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lor-id" className="block text-sm font-medium text-slate-700 mb-2">
          Enter LOR ID
        </label>
        <input
          id="lor-id"
          type="text"
          value={lorId}
          onChange={(e) => setLorId(e.target.value)}
          placeholder="e.g., abc123-def456-ghi789"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          disabled={isLoading}
        />
        <p className="mt-2 text-sm text-slate-500">
          The LOR ID is printed on the document or encoded in the QR code
        </p>
      </div>
      
      <button
        type="submit"
        disabled={!lorId.trim() || isLoading}
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
  );
}
