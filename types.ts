
export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export interface AnalysisResult {
  title: string;
  content: string;
  type: 'text' | 'image-analysis' | 'error';
  sources?: Array<{ web?: { uri: string; title: string } }>;
}

export interface MedicalReport {
  id: string;
  type: 'ECG' | 'XRAY' | 'LAB' | 'MRI';
  imageUrl: string;
  timestamp: Date;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  patientName: string;
  date: string;
  items: LineItem[];
  total: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

export interface PrescriptionData {
  patientName: string;
  age: string;
  gender: string;
  contact: string;
  symptoms: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    weight: string;
  };
  labReport: string;
  investigations: string;
  diagnosis: string;
  summary: string;
  treatment: string;
  followUpDate: string;
  conversationTranscript?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'New' | 'Follow-up' | 'Lab Review';
  status: 'Confirmed' | 'Pending' | 'Completed';
  initialSymptoms: string;
}
