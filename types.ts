
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

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
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
  medications: Medication[];
  followUpDate: string;
  conversationTranscript?: string;
  isReferred?: boolean;
  referredCenter?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'New' | 'Follow-up' | 'Lab Review' | 'Tele-Consult';
  status: 'Confirmed' | 'Pending' | 'Completed';
  initialSymptoms: string;
}

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  fee: number;
  experience: string;
  avatar: string;
}

export interface Alert {
  id: string;
  title: string;
  desc: string;
  role: UserRole;
  type: 'TELE' | 'SYSTEM' | 'BILLING';
  timestamp: Date;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
