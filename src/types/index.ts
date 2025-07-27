export interface User {
  id: string;
  email: string;
  phone?: string;
  profile?: UserProfile;
  hasCompletedOnboarding?: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export emergency contact types from dedicated module
export type {
  EmergencyContact,
  NewEmergencyContact,
  UpdateEmergencyContact,
  StoredEmergencyContacts,
  EmergencyContactsState,
} from './emergencyContact';

export { ContactRelationship, ContactCategory } from './emergencyContact';

export interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  content: GuideContent;
  searchTags: string[];
  version: number;
  isOfflineAvailable: boolean;
  viewCount: number;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuideContent {
  steps: GuideStep[];
  warnings?: string[];
  whenToSeekHelp?: string[];
  preventionTips?: string[];
}

export interface GuideStep {
  order: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
}

export interface MedicalProfile {
  id: string;
  userId: string;
  bloodType?: string;
  emergencyNotes?: string;
  physicianName?: string;
  physicianPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: Allergy[];
  medications?: Medication[];
  conditions?: MedicalCondition[];
  lastUpdated: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  prescribedFor?: string;
  startDate?: string;
  endDate?: string;
}

export interface MedicalCondition {
  id: string;
  conditionName: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  emergencyServices: boolean;
  specialties?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SyncItem {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: string;
  retryCount?: number;
}
