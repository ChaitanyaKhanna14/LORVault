export interface VerificationData {
  status: 'VERIFIED' | 'NOT_FOUND' | 'REVOKED';
  message: string;
  lor?: {
    id: string;
    title: string;
    subject: string;
    studentName: string;
    teacherName: string;
    teacherEmail: string;
    institutionName: string;
    approvedAt: string;
    revokedAt?: string;
    revocationReason?: string;
  };
  verifiedAt: string;
}

interface VerificationResultProps {
  data: VerificationData;
  onVerifyAnother?: () => void;
}

export default function VerificationResult({ data, onVerifyAnother }: VerificationResultProps) {
  const statusConfig = {
    VERIFIED: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-secondary/10',
      textColor: 'text-secondary',
      badgeColor: 'bg-secondary',
      title: 'Verified',
      description: 'This document is authentic and valid.',
    },
    NOT_FOUND: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-danger/10',
      textColor: 'text-danger',
      badgeColor: 'bg-danger',
      title: 'Not Found',
      description: 'This document could not be verified in our system.',
    },
    REVOKED: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      badgeColor: 'bg-warning',
      title: 'Revoked',
      description: 'This document has been revoked and is no longer valid.',
    },
  };

  const config = statusConfig[data.status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Status Header */}
      <div className={`${config.bgColor} p-8 text-center`}>
        <div className={`${config.textColor} flex justify-center mb-4`}>
          {config.icon}
        </div>
        <span className={`${config.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
          {config.title}
        </span>
        <p className={`${config.textColor} mt-3 font-medium`}>
          {config.description}
        </p>
      </div>

      {/* Document Details */}
      {data.lor && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Document Details</h3>
          
          <div className="space-y-3">
            <DetailRow label="Title" value={data.lor.title} />
            <DetailRow label="Subject" value={data.lor.subject} />
            <DetailRow label="Student" value={data.lor.studentName} />
            <DetailRow label="Teacher" value={data.lor.teacherName} />
            <DetailRow label="Teacher Email" value={data.lor.teacherEmail} />
            <DetailRow label="Institution" value={data.lor.institutionName} />
            <DetailRow label="Approved" value={formatDate(data.lor.approvedAt)} />
            
            {data.lor.revokedAt && (
              <>
                <DetailRow label="Revoked" value={formatDate(data.lor.revokedAt)} highlight="danger" />
                {data.lor.revocationReason && (
                  <DetailRow label="Reason" value={data.lor.revocationReason} highlight="danger" />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            Verified at: {formatDate(data.verifiedAt)}
          </p>
          {onVerifyAnother && (
            <button
              onClick={onVerifyAnother}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Verify Another Document
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ 
  label, 
  value, 
  highlight 
}: { 
  label: string; 
  value: string; 
  highlight?: 'danger' | 'warning';
}) {
  const valueColor = highlight === 'danger' 
    ? 'text-danger' 
    : highlight === 'warning' 
      ? 'text-warning' 
      : 'text-slate-800';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-slate-500 text-sm sm:w-32 flex-shrink-0">{label}</span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
