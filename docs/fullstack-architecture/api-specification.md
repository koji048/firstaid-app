# API Specification

## REST API Specification

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
