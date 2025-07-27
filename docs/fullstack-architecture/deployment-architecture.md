# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**

- **Platform:** App Store (iOS) / Google Play Store (Android)
- **Build Command:** `npm run build:mobile:ios` / `npm run build:mobile:android`
- **Output Directory:** `apps/mobile/build`
- **CDN/Edge:** CloudFront for API responses and static assets

**Backend Deployment:**

- **Platform:** AWS Lambda with API Gateway
- **Build Command:** `npm run build:api`
- **Deployment Method:** AWS CDK with GitHub Actions

## CI/CD Pipeline

```yaml

```
