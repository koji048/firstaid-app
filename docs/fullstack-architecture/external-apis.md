# External APIs

## Google Maps API

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

## Firebase Cloud Messaging (FCM) API

- **Purpose:** Push notifications for emergency alerts and updates
- **Documentation:** https://firebase.google.com/docs/cloud-messaging
- **Base URL(s):** https://fcm.googleapis.com/v1
- **Authentication:** OAuth 2.0 with service account
- **Rate Limits:** 600k messages/minute per project

**Key Endpoints Used:**

- `POST /projects/{project_id}/messages:send` - Send push notification

**Integration Notes:** Batch notifications when possible, implement retry logic for failed sends

## Apple Push Notification Service (APNS)

- **Purpose:** iOS push notifications
- **Documentation:** https://developer.apple.com/documentation/usernotifications
- **Base URL(s):** https://api.push.apple.com
- **Authentication:** JWT tokens with p8 certificate
- **Rate Limits:** No hard limit, but throttling may occur

**Key Endpoints Used:**

- `POST /3/device/{device_token}` - Send notification to device

**Integration Notes:** Use HTTP/2 connection pooling, handle token refresh
