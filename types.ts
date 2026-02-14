export interface User {
  id: string;
  name: string;
  department: string;
  photoBase64: string; // The reference image for recognition
  registeredAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'UNKNOWN';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  timestamp: string; // ISO string
  status: AttendanceStatus;
  confidence?: number;
}

export interface RecognitionResult {
  matchedUserId: string | null;
  confidence: number;
  reasoning?: string;
}

export interface DashboardStats {
  totalUsers: number;
  presentToday: number;
  attendanceRate: number;
  recentActivity: AttendanceRecord[];
}