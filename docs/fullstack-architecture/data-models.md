# Data Models

## User Model

**Purpose:** Core user identity and preferences management

**Key Attributes:**

- id: UUID - Unique user identifier
- email: string - Login email
- phone: string - Emergency contact number
- createdAt: DateTime - Account creation
- updatedAt: DateTime - Last modification

**TypeScript Interface:**

```typescript
interface User {
  id: string;
  email: string;
  phone?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  emergencyContacts: EmergencyContact[];
  medicalProfile?: MedicalProfile;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Has one UserProfile
- Has one UserPreferences
- Has many EmergencyContacts
- Has one optional MedicalProfile

## EmergencyContact Model

**Purpose:** Store user's emergency contact information for quick access

**Key Attributes:**

- id: UUID - Unique identifier
- name: string - Contact name
- phone: string - Phone number
- relationship: string - Relationship to user
- isPrimary: boolean - Primary contact flag

**TypeScript Interface:**

```typescript
interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: ContactRelationship;
  category: ContactCategory;
  isPrimary: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum ContactRelationship {
  SPOUSE = 'spouse',
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  FRIEND = 'friend',
  DOCTOR = 'doctor',
  OTHER = 'other',
}

enum ContactCategory {
  FAMILY = 'family',
  MEDICAL = 'medical',
  WORK = 'work',
  OTHER = 'other',
}
```

**Relationships:**

- Belongs to User

## FirstAidGuide Model

**Purpose:** Store first aid procedure content and metadata

**Key Attributes:**

- id: UUID - Unique identifier
- title: string - Guide title
- category: string - Medical category
- content: JSON - Structured content
- version: number - Content version

**TypeScript Interface:**

```typescript
interface FirstAidGuide {
  id: string;
  title: string;
  category: GuideCategory;
  severity: SeverityLevel;
  content: GuideContent;
  media: MediaAsset[];
  searchTags: string[];
  version: number;
  isOfflineAvailable: boolean;
  lastReviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface GuideContent {
  summary: string;
  steps: GuideStep[];
  warnings: string[];
  whenToCallEmergency: string[];
}

interface GuideStep {
  order: number;
  title: string;
  description: string;
  media?: MediaAsset;
  duration?: number; // seconds
}
```

**Relationships:**

- Has many MediaAssets
- Has many UserBookmarks

## MedicalProfile Model

**Purpose:** Store user's medical information for emergency access

**Key Attributes:**

- id: UUID - Unique identifier
- bloodType: string - Blood type
- allergies: Array - Known allergies
- medications: Array - Current medications
- conditions: Array - Medical conditions

**TypeScript Interface:**

```typescript
interface MedicalProfile {
  id: string;
  userId: string;
  bloodType?: BloodType;
  dateOfBirth?: Date;
  allergies: Allergy[];
  medications: Medication[];
  conditions: MedicalCondition[];
  emergencyNotes?: string;
  insuranceInfo?: InsuranceInfo;
  physicianContact?: PhysicianInfo;
  lastUpdated: Date;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedFor: string;
  startDate?: Date;
}
```

**Relationships:**

- Belongs to User
- Has many Allergies
- Has many Medications
- Has many MedicalConditions
