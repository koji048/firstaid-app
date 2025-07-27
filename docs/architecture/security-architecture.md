# Security Architecture

## Authentication Flow

1. User registers with email/password or social login
2. Server generates JWT access token (15 min expiry) and refresh token (30 days)
3. Tokens stored securely in device keychain
4. Access token used for API requests
5. Refresh token used to obtain new access token

## Data Security

- **Encryption at Rest**: All sensitive data encrypted using AES-256
- **Encryption in Transit**: TLS 1.3 for all API communications
- **API Security**: Rate limiting, input validation, SQL injection prevention
- **HIPAA Compliance**: Medical data handled according to HIPAA guidelines
