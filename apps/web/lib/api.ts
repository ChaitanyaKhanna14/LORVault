import axios from 'axios';
import { VerificationData } from '@/components/VerificationResult';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function verifyByLorId(lorId: string): Promise<VerificationData> {
  try {
    const response = await axios.get(`${API_URL}/verify/${lorId}`);
    return {
      status: response.data.status,
      message: response.data.message,
      lor: response.data.lor ? {
        id: response.data.lor.id,
        title: response.data.lor.title,
        subject: response.data.lor.subject,
        studentName: response.data.lor.student?.fullName || 'Unknown',
        teacherName: response.data.lor.teacher?.fullName || 'Unknown',
        teacherEmail: response.data.lor.teacher?.email || 'Unknown',
        institutionName: response.data.lor.institution?.name || 'Unknown',
        approvedAt: response.data.lor.approvedAt,
        revokedAt: response.data.lor.revokedAt,
        revocationReason: response.data.lor.revocationReason,
      } : undefined,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        status: 'NOT_FOUND',
        message: 'Document not found in our system',
        verifiedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

export async function verifyByPdfUpload(file: File): Promise<VerificationData> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/verify/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      status: response.data.status,
      message: response.data.message,
      lor: response.data.lor ? {
        id: response.data.lor.id,
        title: response.data.lor.title,
        subject: response.data.lor.subject,
        studentName: response.data.lor.student?.fullName || 'Unknown',
        teacherName: response.data.lor.teacher?.fullName || 'Unknown',
        teacherEmail: response.data.lor.teacher?.email || 'Unknown',
        institutionName: response.data.lor.institution?.name || 'Unknown',
        approvedAt: response.data.lor.approvedAt,
        revokedAt: response.data.lor.revokedAt,
        revocationReason: response.data.lor.revocationReason,
      } : undefined,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        status: 'NOT_FOUND',
        message: 'Document not found in our system',
        verifiedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}
