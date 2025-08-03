export interface Caregiver {
  id: string;
  name: string;
  role: string;
  phone?: string;
  photo?: string;
}

export interface Visit {
  id: string;
  caregiverId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  careType: string[];
  notes?: string;
  patientName: string;
}

export interface Event {
  id: string;
  visitId: string;
  type: 'check-in' | 'check-out' | 'care-completed' | 'medication' | 'emergency';
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}