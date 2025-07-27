# Security and Performance

## Security Requirements

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

## Performance Optimization

**Frontend Performance:**

- Bundle Size Target: < 20MB initial download
- Loading Strategy: Lazy loading for guides, progressive image loading
- Caching Strategy: SQLite for offline data, 7-day image cache

**Backend Performance:**

- Response Time Target: < 200ms for critical endpoints
- Database Optimization: Connection pooling, indexed queries
- Caching Strategy: Redis for sessions, 5-minute API response cache
