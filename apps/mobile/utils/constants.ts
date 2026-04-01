// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Colors
export const COLORS = {
  primary: '#6366F1',      // Indigo 500
  secondary: '#10B981',    // Emerald 500
  danger: '#EF4444',       // Red 500
  warning: '#F59E0B',      // Amber 500
  background: '#0F172A',   // Slate 900
  surface: '#1E293B',      // Slate 800
  surfaceLight: '#334155', // Slate 700
  text: '#F8FAFC',         // Slate 50
  textMuted: '#94A3B8',    // Slate 400
  border: '#334155',       // Slate 700
};

// Status Colors
export const STATUS_COLORS = {
  SUBMITTED: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  REVOKED: '#64748B',
};

// Verification Result Colors
export const VERIFY_COLORS = {
  VERIFIED: '#10B981',
  NOT_FOUND: '#EF4444',
  REVOKED: '#64748B',
};
