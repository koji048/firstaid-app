# Testing Strategy

## Testing Pyramid

```text
            E2E Tests
           /        \
      Integration Tests
         /            \
    Frontend Unit  Backend Unit
```

## Test Organization

### Frontend Tests

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

### Backend Tests

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

### E2E Tests

```text
e2e/
├── flows/
│   ├── emergency-flow.e2e.ts
│   ├── guide-search.e2e.ts
│   └── offline-mode.e2e.ts
└── helpers/
    └── test-utils.ts
```

## Test Examples

### Frontend Component Test

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

### Backend API Test

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

### E2E Test

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
