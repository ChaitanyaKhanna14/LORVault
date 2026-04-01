import { LorStatus, VerifyResult } from './shared';

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatus(status: LorStatus): string {
  const labels: Record<LorStatus, string> = {
    SUBMITTED: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    REVOKED: 'Revoked',
  };
  return labels[status] || status;
}

export function formatVerifyResult(result: VerifyResult): string {
  const labels: Record<VerifyResult, string> = {
    VERIFIED: 'Verified ✓',
    NOT_FOUND: 'Not Found',
    REVOKED: 'Revoked',
  };
  return labels[result] || result;
}

export function getStatusIcon(status: LorStatus): string {
  const icons: Record<LorStatus, string> = {
    SUBMITTED: '⏳',
    APPROVED: '✅',
    REJECTED: '❌',
    REVOKED: '🚫',
  };
  return icons[status] || '❓';
}

export function getVerifyIcon(result: VerifyResult): string {
  const icons: Record<VerifyResult, string> = {
    VERIFIED: '✅',
    NOT_FOUND: '❌',
    REVOKED: '🚫',
  };
  return icons[result] || '❓';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
