# First Aid Room App Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for First Aid Room App, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Decision**: Custom React Native architecture tailored for mobile-first emergency response
- No specific starter template used due to specialized requirements
- Native mobile app architecture (not web-based)
- Custom offline-first design patterns required
- Emergency mode requires custom low-level optimizations

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-27 | 1.0 | Initial architecture document | System |

## High Level Architecture

### Technical Summary

The First Aid Room App employs a mobile-first architecture using React Native for cross-platform development, with a serverless backend on AWS for scalability and reliability. The frontend utilizes Redux Toolkit for state management with offline-first storage using SQLite and AsyncStorage. Backend services are built with Node.js Lambda functions exposed through API Gateway, with PostgreSQL for persistent data and Redis for caching. The architecture prioritizes offline functionality, sub-2-second emergency response times, and HIPAA-compliant data handling to meet critical medical emergency requirements.

### Platform and Infrastructure Choice

**Platform:** AWS Serverless Stack
**Key Services:** Lambda, API Gateway, RDS PostgreSQL, ElastiCache Redis, S3, CloudFront, Cognito
**Deployment Host and Regions:** US-East-1 (Primary), US-West-2 (DR), EU-West-1 (European expansion)

**Rationale**: AWS provides HIPAA-compliant infrastructure, global scalability, and comprehensive serverless services ideal for variable emergency response loads.

### Repository Structure

**Structure:** Monorepo
**Monorepo Tool:** Nx with npm workspaces
**Package Organization:** Apps (mobile, admin), Services (backend functions), Shared (types, utils, constants)

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "User Devices"
        iOS[iOS App]
        Android[Android App]
        Watch[Apple Watch/Wear OS]
    end
    
    subgraph "CDN Layer"
        CF[CloudFront CDN]
        S3[S3 Static Assets]
    end
    
    subgraph "API Layer"
        APIG[API Gateway]
        ALB[Application Load Balancer]
    end
    
    subgraph "Backend Services"
        Auth[Auth Service<br/>Lambda + Cognito]
        Content[Content Service<br/>Lambda]
        Emergency[Emergency Service<br/>Lambda]
        Medical[Medical Profile Service<br/>Lambda]
        Notification[Notification Service<br/>Lambda + SNS]
    end
    
    subgraph "Data Layer"
        RDS[(PostgreSQL<br/>RDS)]
        Redis[(Redis<br/>ElastiCache)]
        S3Storage[(S3<br/>Media Storage)]
    end
    
    subgraph "External Services"
        Maps[Google Maps API]
        Hospital[Hospital APIs]
        Emergency911[911 Integration]
        Push[FCM/APNS]
    end
    
    iOS --> CF
    Android --> CF
    Watch --> APIG
    
    CF --> S3
    CF --> APIG
    
    APIG --> Auth
    APIG --> Content
    APIG --> Emergency
    APIG --> Medical
    APIG --> Notification
    
    Auth --> RDS
    Auth --> Redis
    Content --> RDS
    Content --> S3Storage
    Emergency --> Maps
    Emergency --> Hospital
    Emergency --> Emergency911
    Medical --> RDS
    Notification --> Push
```

### Architectural Patterns

- **Offline-First Architecture:** Local SQLite with background sync to cloud - _Rationale:_ Emergency access must work without connectivity
- **Serverless Microservices:** Lambda functions for each domain service - _Rationale:_ Scale to zero during quiet periods, instant scale during emergencies
- **Repository Pattern:** Abstract data access for both local and remote storage - _Rationale:_ Seamless offline/online data management
- **Event-Driven Updates:** SNS/SQS for async processing - _Rationale:_ Decouple critical path from non-essential operations
- **Component-Based UI:** Reusable React Native components with TypeScript - _Rationale:_ Rapid development and consistent emergency UI
- **BFF Pattern:** Mobile-optimized API responses - _Rationale:_ Minimize bandwidth usage for emergency scenarios

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe mobile development | Catch errors at compile time for reliability |
| Frontend Framework | React Native | 0.73+ | Cross-platform mobile apps | Single codebase for iOS/Android |
| UI Component Library | React Native Elements | 4.0+ | Pre-built UI components | Consistent, accessible emergency UI |
| State Management | Redux Toolkit | 2.0+ | Global state management | Predictable state with offline support |
| Backend Language | TypeScript | 5.3+ | Type-safe backend development | Consistency with frontend |
| Backend Framework | AWS Lambda + Express | 4.18+ | Serverless API endpoints | Scale automatically with demand |
| API Style | REST | - | HTTP API design | Simple, well-understood patterns |
| Database | PostgreSQL | 15+ | Primary data storage | ACID compliance for medical data |
| Cache | Redis | 7.0+ | Session and data caching | Fast emergency data access |
| File Storage | AWS S3 | - | Media and guide storage | Scalable, CDN-integrated storage |
| Authentication | AWS Cognito | - | User authentication | HIPAA-compliant auth service |
| Frontend Testing | Jest + React Native Testing Library | 29+ | Unit and integration tests | Comprehensive mobile testing |
| Backend Testing | Jest + Supertest | 29+ | API and unit tests | Fast, reliable backend testing |
| E2E Testing | Detox | 20+ | End-to-end mobile testing | Native mobile automation |
| Build Tool | Metro | 0.80+ | React Native bundler | Optimized mobile builds |
| Bundler | Metro | 0.80+ | JavaScript bundling | React Native default |
| IaC Tool | AWS CDK | 2.100+ | Infrastructure as Code | Type-safe infrastructure |
| CI/CD | GitHub Actions | - | Automated deployment | Integrated with repository |
| Monitoring | AWS CloudWatch + Sentry | - | System and error monitoring | Comprehensive observability |
| Logging | CloudWatch Logs | - | Centralized logging | AWS-native log aggregation |
| CSS Framework | React Native StyleSheet | - | Native styling | Platform-optimized styles |

## Data Models

### User Model

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

### EmergencyContact Model

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
  OTHER = 'other'
}

enum ContactCategory {
  FAMILY = 'family',
  MEDICAL = 'medical',
  WORK = 'work',
  OTHER = 'other'
}
```

**Relationships:**
- Belongs to User

### FirstAidGuide Model

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

### MedicalProfile Model

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

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: First Aid Room App API
  version: 1.0.0
  description: REST API for First Aid Room mobile application
servers:
  - url: https://api.firstaidroom.app/v1
    description: Production API
  - url: https://staging-api.firstaidroom.app/v1
    description: Staging API

paths:
  # Authentication
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: User created successfully
          
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  expiresIn:
                    type: number

  # Emergency Contacts
  /emergency-contacts:
    get:
      summary: Get user's emergency contacts
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of emergency contacts
    post:
      summary: Add new emergency contact
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmergencyContact'
              
  # First Aid Guides
  /guides:
    get:
      summary: Get first aid guides
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
        - name: offline
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: List of guides
          
  /guides/{guideId}:
    get:
      summary: Get specific guide details
      parameters:
        - name: guideId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Guide details
          
  # Medical Profile
  /medical-profile:
    get:
      summary: Get user's medical profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Medical profile data
    put:
      summary: Update medical profile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MedicalProfile'
              
  # Emergency Services
  /emergency/hospitals:
    get:
      summary: Find nearby hospitals
      parameters:
        - name: lat
          in: query
          required: true
          schema:
            type: number
        - name: lng
          in: query
          required: true
          schema:
            type: number
        - name: radius
          in: query
          schema:
            type: number
            default: 10
      responses:
        '200':
          description: List of nearby hospitals

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Components

### Mobile App (React Native)

**Responsibility:** Cross-platform mobile application providing emergency first aid access

**Key Interfaces:**
- User authentication and profile management
- Emergency contact quick dial
- First aid guide browser and viewer
- Offline data synchronization
- Medical profile management

**Dependencies:** REST API, Local SQLite, AsyncStorage

**Technology Stack:** React Native 0.73+, TypeScript, Redux Toolkit, React Navigation

### Auth Service (Lambda)

**Responsibility:** Handle user authentication, registration, and token management

**Key Interfaces:**
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

**Dependencies:** AWS Cognito, PostgreSQL, Redis

**Technology Stack:** Node.js, Express, AWS Lambda, JWT

### Content Service (Lambda)

**Responsibility:** Manage first aid guides and media content delivery

**Key Interfaces:**
- GET /guides
- GET /guides/:id
- GET /guides/download
- POST /guides/bookmark

**Dependencies:** PostgreSQL, S3, CloudFront

**Technology Stack:** Node.js, Express, AWS Lambda

### Emergency Service (Lambda)

**Responsibility:** Handle emergency-related features and integrations

**Key Interfaces:**
- GET /emergency/hospitals
- POST /emergency/alert
- GET /emergency/services
- POST /emergency/share-location

**Dependencies:** Google Maps API, Hospital APIs, PostgreSQL

**Technology Stack:** Node.js, Express, AWS Lambda

### Medical Profile Service (Lambda)

**Responsibility:** Manage user medical information securely

**Key Interfaces:**
- GET /medical-profile
- PUT /medical-profile
- GET /medical-profile/card
- POST /medical-profile/share

**Dependencies:** PostgreSQL, S3 (for medical cards)

**Technology Stack:** Node.js, Express, AWS Lambda

### Notification Service (Lambda)

**Responsibility:** Handle push notifications and alerts

**Key Interfaces:**
- POST /notifications/register-device
- POST /notifications/send
- PUT /notifications/preferences

**Dependencies:** FCM, APNS, PostgreSQL

**Technology Stack:** Node.js, AWS Lambda, SNS

### Component Diagrams

```mermaid
graph LR
    subgraph "Mobile App"
        UI[UI Components]
        Redux[Redux Store]
        API[API Client]
        Local[Local Storage]
        Sync[Sync Manager]
    end
    
    subgraph "Backend Services"
        Gateway[API Gateway]
        Auth[Auth Service]
        Content[Content Service]
        Emergency[Emergency Service]
        Medical[Medical Service]
    end
    
    subgraph "Data Stores"
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
        S3[(S3 Storage)]
    end
    
    UI --> Redux
    Redux --> API
    Redux --> Local
    API --> Gateway
    Local --> Sync
    Sync --> Gateway
    
    Gateway --> Auth
    Gateway --> Content
    Gateway --> Emergency
    Gateway --> Medical
    
    Auth --> PG
    Auth --> Redis
    Content --> PG
    Content --> S3
    Emergency --> PG
    Medical --> PG
```

## External APIs

### Google Maps API

- **Purpose:** Hospital location, directions, and emergency service routing
- **Documentation:** https://developers.google.com/maps
- **Base URL(s):** https://maps.googleapis.com/maps/api
- **Authentication:** API Key with restrictions
- **Rate Limits:** 25,000 requests/day (free tier)

**Key Endpoints Used:**
- `GET /place/nearbysearch` - Find nearby hospitals
- `GET /directions` - Get directions to hospital
- `GET /geocode` - Convert addresses to coordinates

**Integration Notes:** Implement caching for common locations, fallback to offline data when unavailable

### Firebase Cloud Messaging (FCM) API

- **Purpose:** Push notifications for emergency alerts and updates
- **Documentation:** https://firebase.google.com/docs/cloud-messaging
- **Base URL(s):** https://fcm.googleapis.com/v1
- **Authentication:** OAuth 2.0 with service account
- **Rate Limits:** 600k messages/minute per project

**Key Endpoints Used:**
- `POST /projects/{project_id}/messages:send` - Send push notification

**Integration Notes:** Batch notifications when possible, implement retry logic for failed sends

### Apple Push Notification Service (APNS)

- **Purpose:** iOS push notifications
- **Documentation:** https://developer.apple.com/documentation/usernotifications
- **Base URL(s):** https://api.push.apple.com
- **Authentication:** JWT tokens with p8 certificate
- **Rate Limits:** No hard limit, but throttling may occur

**Key Endpoints Used:**
- `POST /3/device/{device_token}` - Send notification to device

**Integration Notes:** Use HTTP/2 connection pooling, handle token refresh

## Core Workflows

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Local DB
    participant API Gateway
    participant Auth Service
    participant Content Service
    participant Redis
    participant PostgreSQL
    
    User->>App: Open App
    App->>Local DB: Check cached auth
    
    alt Has valid cached token
        App->>App: Use cached token
    else No valid token
        App->>API Gateway: Login request
        API Gateway->>Auth Service: Validate credentials
        Auth Service->>PostgreSQL: Check user
        Auth Service->>Redis: Store session
        Auth Service-->>API Gateway: Return tokens
        API Gateway-->>App: Auth tokens
        App->>Local DB: Cache tokens
    end
    
    User->>App: Search "CPR"
    App->>Local DB: Check offline guides
    
    alt Guide available offline
        Local DB-->>App: Return guide
    else Guide not offline
        App->>API Gateway: GET /guides?search=CPR
        API Gateway->>Content Service: Search guides
        Content Service->>PostgreSQL: Query guides
        Content Service-->>API Gateway: Guide data
        API Gateway-->>App: Guide results
        App->>Local DB: Cache guide
    end
    
    App->>User: Display CPR guide
```

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Local DB
    participant GPS
    participant API Gateway
    participant Emergency Service
    participant Maps API
    participant Phone
    
    User->>App: Tap Emergency Button
    App->>App: Enter Emergency Mode
    App->>GPS: Get location
    GPS-->>App: Lat/Lng coordinates
    
    par Find Hospitals
        App->>API Gateway: GET /emergency/hospitals
        API Gateway->>Emergency Service: Find hospitals
        Emergency Service->>Maps API: Nearby search
        Maps API-->>Emergency Service: Hospital list
        Emergency Service-->>API Gateway: Formatted results
        API Gateway-->>App: Hospital data
    and Get Emergency Contacts
        App->>Local DB: Get primary contact
        Local DB-->>App: Contact info
    end
    
    App->>User: Show hospitals & contact
    User->>App: Call Emergency Contact
    App->>Phone: Initiate call
    
    opt Share Location
        User->>App: Share location
        App->>API Gateway: POST /emergency/share-location
        API Gateway->>Emergency Service: Process location
        Emergency Service-->>API Gateway: Share link
        API Gateway-->>App: Location URL
        App->>Phone: Send SMS with location
    end
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_primary (user_id, is_primary)
);

-- First aid guides
CREATE TABLE first_aid_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    content JSONB NOT NULL,
    search_tags TEXT[],
    version INTEGER DEFAULT 1,
    is_offline_available BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_search_tags (search_tags) USING GIN
);

-- Guide media assets
CREATE TABLE guide_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID NOT NULL REFERENCES first_aid_guides(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- image, video
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical profiles
CREATE TABLE medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10),
    emergency_notes TEXT,
    physician_name VARCHAR(200),
    physician_phone VARCHAR(20),
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Allergies
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reaction TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medications
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_for VARCHAR(200),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical conditions
CREATE TABLE medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(200) NOT NULL,
    diagnosed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User guide bookmarks
CREATE TABLE user_guide_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES first_aid_guides(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, guide_id)
);

-- Offline sync tracking
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- create, update, delete
    data JSONB NOT NULL,
    synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_user_unsynced (user_id, synced)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_guides_title ON first_aid_guides(title);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_first_aid_guides_updated_at BEFORE UPDATE ON first_aid_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Frontend Architecture

### Component Architecture

#### Component Organization

```text
apps/mobile/src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── LoadingSpinner/
│   │   └── ErrorBoundary/
│   ├── emergency/
│   │   ├── EmergencyButton/
│   │   ├── ContactQuickDial/
│   │   └── LocationShare/
│   ├── guides/
│   │   ├── GuideCard/
│   │   ├── GuideViewer/
│   │   ├── StepNavigator/
│   │   └── SearchBar/
│   └── medical/
│       ├── MedicalProfileForm/
│       ├── AllergyList/
│       └── MedicationList/
├── screens/
│   ├── HomeScreen/
│   ├── EmergencyScreen/
│   ├── GuidesScreen/
│   ├── ProfileScreen/
│   └── SettingsScreen/
├── navigation/
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── AuthNavigator.tsx
└── hooks/
    ├── useEmergencyMode.ts
    ├── useOfflineSync.ts
    └── useLocation.ts
```

#### Component Template

```typescript
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { styles } from './ComponentName.styles';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export const ComponentName = memo<ComponentNameProps>(({
  title,
  onPress,
  disabled = false,
  testID = 'component-name'
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
});

ComponentName.displayName = 'ComponentName';
```

### State Management Architecture

#### State Structure

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import guidesReducer from './slices/guidesSlice';
import emergencyReducer from './slices/emergencySlice';
import medicalReducer from './slices/medicalSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guides: guidesReducer,
    emergency: emergencyReducer,
    medical: medicalReducer,
    offline: offlineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// State shape
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    tokens: AuthTokens | null;
  };
  guides: {
    guides: FirstAidGuide[];
    currentGuide: FirstAidGuide | null;
    bookmarks: string[];
    downloadedGuides: string[];
  };
  emergency: {
    contacts: EmergencyContact[];
    primaryContact: EmergencyContact | null;
    isEmergencyMode: boolean;
    nearbyHospitals: Hospital[];
  };
  medical: {
    profile: MedicalProfile | null;
    isLoading: boolean;
  };
  offline: {
    syncQueue: SyncItem[];
    lastSyncTime: string | null;
    isOnline: boolean;
  };
}
```

#### State Management Patterns

- Use Redux Toolkit slices for feature-based organization
- Implement RTK Query for API data fetching with caching
- Use normalized state shape for entities (guides, contacts)
- Persist critical state to AsyncStorage (auth, emergency contacts)
- Implement optimistic updates for offline actions
- Use selectors for derived state computation

### Routing Architecture

#### Route Organization

```text
Navigation Structure:
├── RootNavigator (Stack)
│   ├── AuthNavigator (Stack) - Not authenticated
│   │   ├── WelcomeScreen
│   │   ├── LoginScreen
│   │   ├── RegisterScreen
│   │   └── ForgotPasswordScreen
│   └── MainNavigator (Tab) - Authenticated
│       ├── HomeStack
│       │   ├── HomeScreen
│       │   └── EmergencyModeScreen
│       ├── GuidesStack
│       │   ├── GuidesListScreen
│       │   ├── GuideDetailScreen
│       │   └── GuideSearchScreen
│       ├── MedicalStack
│       │   ├── MedicalProfileScreen
│       │   └── MedicalEditScreen
│       └── SettingsStack
│           ├── SettingsScreen
│           ├── ProfileScreen
│           └── AboutScreen
```

#### Protected Route Pattern

```typescript
// navigation/ProtectedRoute.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from '@react-navigation/native';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useSelector((state: RootState) => state.auth.user?.hasCompletedOnboarding);

  if (!isAuthenticated) {
    return <Navigate to="Login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="Onboarding" />;
  }

  return <>{children}</>;
};

// Usage in navigator
<Stack.Screen
  name="Medical"
  component={ProtectedRoute}
>
  <MedicalNavigator />
</Stack.Screen>
```

### Frontend Services Layer

#### API Client Setup

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../../store/store';
import { addToSyncQueue } from '../../store/slices/offlineSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.firstaidroom.app/v1';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          await this.refreshToken();
        }
        
        if (!error.response && error.code === 'NETWORK_ERROR') {
          // Handle offline mode
          return this.handleOfflineRequest(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  private async handleOfflineRequest(config: AxiosRequestConfig) {
    const { method, url, data } = config;
    
    if (method === 'GET') {
      // Try to return cached data
      const cachedData = await this.getCachedData(url!);
      if (cachedData) {
        return { data: cachedData, cached: true };
      }
    } else {
      // Queue mutation for sync
      store.dispatch(addToSyncQueue({
        method: method!,
        url: url!,
        data,
        timestamp: new Date().toISOString(),
      }));
    }
    
    throw new Error('No network connection');
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### Service Example

```typescript
// services/emergency.service.ts
import { apiClient } from './api/client';
import { EmergencyContact, Hospital } from '@shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class EmergencyService {
  private static CONTACTS_CACHE_KEY = 'emergency_contacts';
  
  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const contacts = await apiClient.get<EmergencyContact[]>('/emergency-contacts');
      // Cache for offline access
      await AsyncStorage.setItem(this.CONTACTS_CACHE_KEY, JSON.stringify(contacts));
      return contacts;
    } catch (error) {
      // Fallback to cached data
      const cached = await AsyncStorage.getItem(this.CONTACTS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }
  
  static async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const newContact = await apiClient.post<EmergencyContact>('/emergency-contacts', contact);
    
    // Update cache
    const cached = await AsyncStorage.getItem(this.CONTACTS_CACHE_KEY);
    if (cached) {
      const contacts = JSON.parse(cached);
      contacts.push(newContact);
      await AsyncStorage.setItem(this.CONTACTS_CACHE_KEY, JSON.stringify(contacts));
    }
    
    return newContact;
  }
  
  static async findNearbyHospitals(latitude: number, longitude: number, radius: number = 10): Promise<Hospital[]> {
    try {
      const hospitals = await apiClient.get<Hospital[]>('/emergency/hospitals', {
        params: { lat: latitude, lng: longitude, radius }
      });
      return hospitals;
    } catch (error) {
      // Return empty array if offline
      console.error('Failed to fetch hospitals:', error);
      return [];
    }
  }
  
  static async callEmergency(contactId: string, location?: { lat: number; lng: number }) {
    // Log the emergency call attempt
    await apiClient.post('/emergency/call-log', {
      contactId,
      location,
      timestamp: new Date().toISOString()
    }).catch(() => {
      // Don't block the call if logging fails
    });
  }
}
```

## Backend Architecture

### Service Architecture

#### Function Organization

```text
apps/api/src/
├── functions/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   ├── refresh.ts
│   │   └── logout.ts
│   ├── emergency/
│   │   ├── contacts.ts
│   │   ├── hospitals.ts
│   │   ├── alert.ts
│   │   └── location.ts
│   ├── guides/
│   │   ├── list.ts
│   │   ├── detail.ts
│   │   ├── search.ts
│   │   └── bookmark.ts
│   └── medical/
│       ├── profile.ts
│       ├── allergies.ts
│       └── medications.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── validation.ts
│   └── rateLimiter.ts
├── services/
│   ├── database.ts
│   ├── cache.ts
│   ├── storage.ts
│   └── notification.ts
└── utils/
    ├── logger.ts
    ├── response.ts
    └── crypto.ts
```

#### Function Template

```typescript
// functions/auth/login.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createResponse, createErrorResponse } from '../../utils/response';
import { validateRequest } from '../../middleware/validation';
import { UserRepository } from '../../repositories/userRepository';
import { CacheService } from '../../services/cache';
import { logger } from '../../utils/logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Validate request
    const body = validateRequest(event.body, loginSchema);
    
    // Get user
    const userRepo = new UserRepository();
    const user = await userRepo.findByEmail(body.email);
    
    if (!user || !await bcrypt.compare(body.password, user.passwordHash)) {
      return createErrorResponse(401, 'Invalid credentials');
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );
    
    // Cache session
    const cache = new CacheService();
    await cache.set(`session:${user.id}`, { refreshToken }, 30 * 24 * 60 * 60);
    
    // Log successful login
    logger.info('User logged in', { userId: user.id });
    
    return createResponse(200, {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    return createErrorResponse(500, 'Internal server error');
  }
};
```

### Database Architecture

#### Schema Design

```sql
-- See Database Schema section above for complete SQL
```

#### Data Access Layer

```typescript
// repositories/baseRepository.ts
import { Pool } from 'pg';
import { CacheService } from '../services/cache';

export abstract class BaseRepository<T> {
  protected pool: Pool;
  protected cache: CacheService;
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
    });
    this.cache = new CacheService();
  }
  
  async findById(id: string): Promise<T | null> {
    // Check cache first
    const cacheKey = `${this.tableName}:${id}`;
    const cached = await this.cache.get<T>(cacheKey);
    if (cached) return cached;
    
    // Query database
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const entity = this.mapRowToEntity(result.rows[0]);
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, entity, 300);
    
    return entity;
  }
  
  async create(data: Partial<T>): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    const entity = this.mapRowToEntity(result.rows[0]);
    
    // Invalidate cache
    await this.cache.delete(`${this.tableName}:list`);
    
    return entity;
  }
  
  abstract mapRowToEntity(row: any): T;
}

// repositories/emergencyContactRepository.ts
import { BaseRepository } from './baseRepository';
import { EmergencyContact } from '@shared/types';

export class EmergencyContactRepository extends BaseRepository<EmergencyContact> {
  constructor() {
    super('emergency_contacts');
  }
  
  async findByUserId(userId: string): Promise<EmergencyContact[]> {
    const result = await this.pool.query(
      'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC',
      [userId]
    );
    
    return result.rows.map(row => this.mapRowToEntity(row));
  }
  
  async getPrimaryContact(userId: string): Promise<EmergencyContact | null> {
    const result = await this.pool.query(
      'SELECT * FROM emergency_contacts WHERE user_id = $1 AND is_primary = true LIMIT 1',
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    
    return this.mapRowToEntity(result.rows[0]);
  }
  
  mapRowToEntity(row: any): EmergencyContact {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      phone: row.phone,
      relationship: row.relationship,
      category: row.category,
      isPrimary: row.is_primary,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Auth Lambda
    participant Cognito
    participant Database
    participant Redis
    
    Client->>API Gateway: POST /auth/register
    API Gateway->>Auth Lambda: Register request
    Auth Lambda->>Cognito: Create user
    Cognito-->>Auth Lambda: User created
    Auth Lambda->>Database: Store user profile
    Auth Lambda-->>API Gateway: Success
    API Gateway-->>Client: Registration complete
    
    Client->>API Gateway: POST /auth/login
    API Gateway->>Auth Lambda: Login request
    Auth Lambda->>Cognito: Authenticate
    Cognito-->>Auth Lambda: Auth tokens
    Auth Lambda->>Redis: Cache session
    Auth Lambda-->>API Gateway: Tokens
    API Gateway-->>Client: Access + Refresh tokens
    
    Client->>API Gateway: GET /api/resource
    API Gateway->>API Gateway: Validate JWT
    API Gateway->>Lambda: Authorized request
    Lambda->>Database: Get data
    Lambda-->>API Gateway: Response
    API Gateway-->>Client: Protected resource
```

#### Middleware/Guards

```typescript
// middleware/auth.ts
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { CacheService } from '../services/cache';

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = async (
  event: APIGatewayProxyEvent,
  context: Context,
  next: Function
) => {
  try {
    const token = event.headers.Authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if session is valid in cache
    const cache = new CacheService();
    const session = await cache.get(`session:${decoded.userId}`);
    
    if (!session) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Session expired' }),
      };
    }
    
    // Attach user to event
    (event as AuthenticatedEvent).user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    return next();
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
};

// Usage example
export const protectedHandler = authMiddleware(async (event: AuthenticatedEvent) => {
  // Access user from event.user
  const { userId } = event.user;
  
  // Protected logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ userId, message: 'Protected resource' }),
  };
});
```

## Unified Project Structure

```plaintext
first-aid-room-app/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       ├── deploy-staging.yaml
│       └── deploy-production.yaml
├── apps/                       # Application packages
│   ├── mobile/                 # React Native app
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # Navigation setup
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API client services
│   │   │   ├── store/          # Redux store
│   │   │   ├── styles/         # Global styles/themes
│   │   │   └── utils/          # Frontend utilities
│   │   ├── android/            # Android specific
│   │   ├── ios/                # iOS specific
│   │   ├── assets/             # Images, fonts
│   │   ├── __tests__/          # Frontend tests
│   │   └── package.json
│   └── api/                    # Backend Lambda functions
│       ├── src/
│       │   ├── functions/      # Lambda handlers
│       │   ├── middleware/     # Express middleware
│       │   ├── repositories/   # Data access layer
│       │   ├── services/       # Business logic
│       │   ├── utils/          # Backend utilities
│       │   └── types/          # Backend types
│       ├── tests/              # Backend tests
│       └── package.json
├── packages/                   # Shared packages
│   ├── shared/                 # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── constants/      # Shared constants
│   │   │   ├── validators/     # Shared validation
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       ├── typescript/
│       └── jest/
├── infrastructure/             # IaC definitions
│   ├── cdk/                    # AWS CDK
│   │   ├── lib/
│   │   │   ├── stacks/
│   │   │   └── constructs/
│   │   └── bin/
│   └── scripts/                # Deploy scripts
├── docs/                       # Documentation
│   ├── prd.md
│   ├── architecture.md
│   └── api/                    # API docs
├── scripts/                    # Build/utility scripts
│   ├── setup.sh
│   ├── build.sh
│   └── deploy.sh
├── .env.example                # Environment template
├── nx.json                     # Nx configuration
├── package.json                # Root package.json
├── tsconfig.base.json          # Base TypeScript config
└── README.md
```

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Required software
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
git --version   # v2.30.0 or higher

# Mobile development
react-native --version  # 0.73.0 or higher
# iOS: Xcode 14+ with iOS Simulator
# Android: Android Studio with Android SDK 31+

# Backend development
aws --version  # AWS CLI v2
docker --version  # Docker 20+ for local PostgreSQL/Redis
```

#### Initial Setup

```bash
# Clone repository
git clone https://github.com/org/first-aid-room-app.git
cd first-aid-room-app

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd apps/mobile/ios && pod install && cd ../../..

# Setup environment variables
cp .env.example .env.local
cp apps/mobile/.env.example apps/mobile/.env
cp apps/api/.env.example apps/api/.env

# Initialize database (local Docker)
docker-compose up -d postgres redis
npm run db:migrate
npm run db:seed

# Build shared packages
npm run build:shared
```

#### Development Commands

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:mobile

# Start backend only
npm run dev:api

# Run tests
npm run test
npm run test:mobile
npm run test:api
npm run test:e2e
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
REACT_APP_API_URL=http://localhost:3000/v1
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Backend (.env)
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/firstaid
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
AWS_REGION=us-east-1
S3_BUCKET=firstaid-dev-assets

# Shared
APP_VERSION=1.0.0
LOG_LEVEL=debug
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** App Store (iOS) / Google Play Store (Android)
- **Build Command:** `npm run build:mobile:ios` / `npm run build:mobile:android`
- **Output Directory:** `apps/mobile/build`
- **CDN/Edge:** CloudFront for API responses and static assets

**Backend Deployment:**
- **Platform:** AWS Lambda with API Gateway
- **Build Command:** `npm run build:api`
- **Deployment Method:** AWS CDK with GitHub Actions

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build packages
        run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy with CDK
        run: |
          npm ci
          npm run build:api
          npm run cdk:deploy:prod

  build-mobile:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup React Native environment
        run: |
          npm ci
          cd apps/mobile/ios && pod install
      
      - name: Build iOS
        run: |
          cd apps/mobile
          npx react-native build-ios --mode=Release
      
      - name: Upload to TestFlight
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: apps/mobile/ios/build/FirstAidRoom.ipa
          api-key: ${{ secrets.APP_STORE_API_KEY }}
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:8081 | http://localhost:3000 | Local development |
| Staging | https://staging.firstaidroom.app | https://staging-api.firstaidroom.app | Pre-production testing |
| Production | https://apps.apple.com/firstaidroom | https://api.firstaidroom.app | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; img-src 'self' data: https:; script-src 'self'`
- XSS Prevention: React Native's built-in protections, input sanitization
- Secure Storage: iOS Keychain / Android Keystore for sensitive data

**Backend Security:**
- Input Validation: Zod schemas for all API inputs
- Rate Limiting: 100 requests per minute per IP
- CORS Policy: Restricted to app domains only

**Authentication Security:**
- Token Storage: Secure device storage (Keychain/Keystore)
- Session Management: 15-minute access tokens, 30-day refresh tokens
- Password Policy: Minimum 8 characters, complexity requirements

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 20MB initial download
- Loading Strategy: Lazy loading for guides, progressive image loading
- Caching Strategy: SQLite for offline data, 7-day image cache

**Backend Performance:**
- Response Time Target: < 200ms for critical endpoints
- Database Optimization: Connection pooling, indexed queries
- Caching Strategy: Redis for sessions, 5-minute API response cache

## Testing Strategy

### Testing Pyramid

```text
            E2E Tests
           /        \
      Integration Tests
         /            \
    Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests

```text
apps/mobile/__tests__/
├── components/
│   ├── Button.test.tsx
│   └── EmergencyButton.test.tsx
├── screens/
│   ├── HomeScreen.test.tsx
│   └── GuideScreen.test.tsx
├── hooks/
│   └── useEmergencyMode.test.ts
└── services/
    └── emergency.service.test.ts
```

#### Backend Tests

```text
apps/api/tests/
├── unit/
│   ├── repositories/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   ├── emergency.test.ts
│   └── guides.test.ts
└── fixtures/
    └── test-data.ts
```

#### E2E Tests

```text
e2e/
├── flows/
│   ├── emergency-flow.e2e.ts
│   ├── guide-search.e2e.ts
│   └── offline-mode.e2e.ts
└── helpers/
    └── test-utils.ts
```

### Test Examples

#### Frontend Component Test

```typescript
// __tests__/components/EmergencyButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmergencyButton } from '../../src/components/emergency/EmergencyButton';

describe('EmergencyButton', () => {
  it('should trigger emergency mode on press', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <EmergencyButton onPress={onPress} />
    );
    
    const button = getByTestId('emergency-button');
    fireEvent.press(button);
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('should show animation during emergency mode', () => {
    const { getByTestId, rerender } = render(
      <EmergencyButton isEmergencyMode={false} />
    );
    
    expect(getByTestId('emergency-button')).not.toHaveStyle({ backgroundColor: 'red' });
    
    rerender(<EmergencyButton isEmergencyMode={true} />);
    
    expect(getByTestId('emergency-button')).toHaveStyle({ backgroundColor: 'red' });
  });
});
```

#### Backend API Test

```typescript
// tests/integration/emergency.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { createTestUser, cleanupDatabase } from '../helpers';

describe('Emergency Contacts API', () => {
  let authToken: string;
  let userId: string;
  
  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user.id;
  });
  
  afterEach(async () => {
    await cleanupDatabase();
  });
  
  describe('POST /emergency-contacts', () => {
    it('should create emergency contact', async () => {
      const contactData = {
        name: 'John Doe',
        phone: '+1234567890',
        relationship: 'spouse',
        category: 'family',
        isPrimary: true,
      };
      
      const response = await request(app)
        .post('/v1/emergency-contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contactData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...contactData,
        userId,
      });
    });
    
    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/v1/emergency-contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          phone: 'invalid-phone',
          relationship: 'spouse',
          category: 'family',
        })
        .expect(400);
      
      expect(response.body.error).toContain('Invalid phone number');
    });
  });
});
```

#### E2E Test

```typescript
// e2e/flows/emergency-flow.e2e.ts
import { device, element, by, expect } from 'detox';

describe('Emergency Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should complete emergency contact flow', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Navigate to emergency screen
    await element(by.id('tab-emergency')).tap();
    
    // Trigger emergency mode
    await element(by.id('emergency-button')).tap();
    
    // Verify emergency mode UI
    await expect(element(by.id('emergency-mode-indicator'))).toBeVisible();
    await expect(element(by.id('primary-contact-dial'))).toBeVisible();
    
    // Test location sharing
    await element(by.id('share-location-button')).tap();
    await expect(element(by.text('Location shared'))).toBeVisible();
  });
});
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Offline First:** Always implement offline fallbacks for critical features
- **Security:** Never log sensitive data, always validate inputs
- **Performance:** Implement pagination for lists, lazy load images

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `EmergencyButton.tsx` |
| Hooks | camelCase with 'use' | - | `useOfflineSync.ts` |
| API Routes | - | kebab-case | `/api/emergency-contacts` |
| Database Tables | - | snake_case | `emergency_contacts` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Functions | camelCase | camelCase | `findNearbyHospitals()` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant Service
    participant Database
    
    User->>App: Perform action
    App->>API: API request
    API->>Service: Process request
    Service->>Database: Query data
    
    alt Database error
        Database-->>Service: Error
        Service-->>API: Throw ServiceError
        API-->>API: Error middleware
        API-->>App: Formatted error response
        App-->>App: Show error toast
        App-->>User: Display error message
    else Success
        Database-->>Service: Data
        Service-->>API: Processed data
        API-->>App: Success response
        App-->>User: Update UI
    end
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling

```typescript
// utils/errorHandler.ts
import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';

export class ErrorHandler {
  static handle(error: any, context?: string) {
    console.error(`Error in ${context}:`, error);
    
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { context },
    });
    
    // User-friendly message
    const message = this.getUserMessage(error);
    
    if (error.code === 'NETWORK_ERROR') {
      // Don't show alert for network errors in offline mode
      return;
    }
    
    Alert.alert(
      'Error',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }
  
  private static getUserMessage(error: any): string {
    const errorMessages: Record<string, string> = {
      'AUTH_FAILED': 'Invalid email or password',
      'NETWORK_ERROR': 'No internet connection',
      'VALIDATION_ERROR': 'Please check your input',
      'PERMISSION_DENIED': 'You do not have permission',
      'NOT_FOUND': 'Resource not found',
    };
    
    return errorMessages[error.code] || 'Something went wrong. Please try again.';
  }
}

// Usage in component
try {
  await EmergencyService.addContact(contactData);
} catch (error) {
  ErrorHandler.handle(error, 'AddEmergencyContact');
}
```

### Backend Error Handling

```typescript
// middleware/errorHandler.ts
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: any): APIGatewayProxyResult => {
  const requestId = uuidv4();
  
  // Log error
  logger.error('Request failed', {
    error: error.message,
    stack: error.stack,
    requestId,
  });
  
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };
  }
  
  // Generic error
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId,
      },
    }),
  };
};

// Usage in Lambda function
export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Business logic
    if (!event.body) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Request body is required');
    }
    
    // Process request...
  } catch (error) {
    return errorHandler(error);
  }
};
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Sentry for React Native
- **Backend Monitoring:** AWS CloudWatch + X-Ray
- **Error Tracking:** Sentry for both frontend and backend
- **Performance Monitoring:** CloudWatch metrics + custom dashboards

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals
- JavaScript errors
- API response times
- User interactions

**Backend Metrics:**
- Request rate
- Error rate
- Response time
- Database query performance

## Checklist Results Report

The architecture document is now complete. Key architectural decisions include:

1. **Mobile-First Design**: React Native for cross-platform mobile development
2. **Offline-First Architecture**: SQLite local storage with background sync
3. **Serverless Backend**: AWS Lambda for scalability and cost efficiency
4. **HIPAA Compliance**: Secure storage and transmission of medical data
5. **Emergency Optimization**: Sub-2-second response times for critical features
6. **Monorepo Structure**: Shared code between frontend and backend
7. **Comprehensive Testing**: Unit, integration, and E2E testing strategies

The architecture supports all requirements from the PRD including offline functionality, emergency features, medical profile management, and future scalability for advanced features like AI assistance and AR guidance.