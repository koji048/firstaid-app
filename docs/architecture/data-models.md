# Data Models

## User Model

```typescript
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  emergencyContacts: EmergencyContact[];
}
```

## Emergency Contact Model

```typescript
interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}
```

## First Aid Guide Model

```typescript
interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  content: string;
  media: MediaAsset[];
  translations: Translation[];
}
```
