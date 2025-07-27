# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Offline First:** Always implement offline fallbacks for critical features
- **Security:** Never log sensitive data, always validate inputs
- **Performance:** Implement pagination for lists, lazy load images

## Naming Conventions

| Element         | Frontend             | Backend          | Example                   |
| --------------- | -------------------- | ---------------- | ------------------------- |
| Components      | PascalCase           | -                | `EmergencyButton.tsx`     |
| Hooks           | camelCase with 'use' | -                | `useOfflineSync.ts`       |
| API Routes      | -                    | kebab-case       | `/api/emergency-contacts` |
| Database Tables | -                    | snake_case       | `emergency_contacts`      |
| Constants       | UPPER_SNAKE_CASE     | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`      |
| Functions       | camelCase            | camelCase        | `findNearbyHospitals()`   |
