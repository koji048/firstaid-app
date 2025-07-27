Factory Hospital Room Application Fullstack Architecture Document
Introduction

This document outlines the complete fullstack architecture for the Factory Hospital Room Application, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack. This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process.

Starter Template or Existing Project: N/A - Greenfield project.

Change Log:
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-07-26 | 1.0 | Initial draft created interactively. | Winston (Architect)|

High Level Architecture
Technical Summary

The architecture for the Factory Hospital Room Application will be a modern, cloud-native system deployed on AWS, following a Serverless pattern. It will feature a responsive web frontend that communicates with backend services via a secure API layer. The system will be developed within a Monorepo to streamline development and code sharing. This architecture prioritizes security, scalability, and cost-efficiency, ensuring compliance with Thailand's PDPA while delivering the real-time data collection and reporting capabilities outlined in the PRD.

Platform and Infrastructure Choice

Platform: AWS (Amazon Web Services)

Key Services: We will primarily use AWS Lambda for backend logic, Amazon API Gateway for the API layer, Amazon DynamoDB for our database, Amazon S3 for data storage, and AWS Cognito for user authentication.

Rationale: This serverless stack is highly scalable, requires no server management, and is extremely cost-effective.

Repository Structure

The project will use a Monorepo structure.

Monorepo Tool: A standard tool like npm workspaces or Turborepo will be used.

Package Organization: The monorepo will contain separate packages for the frontend application (apps/web), the backend services (apps/api), and a shared library (packages/shared).

High Level Architecture Diagram

Code snippet
graph TD
    A[User (Nurse)] --> B{Web Application (Browser)};
    B --> C[API Gateway];
    C --> D[Lambda: Auth];
    C --> E[Lambda: Visit Logging];
    C --> F[Lambda: Reporting];
    E --> G[DynamoDB/Database];
    F --> G;
    H[S3: Health Data Excel File] --> I[Lambda: Data Import (Scheduled)];
    I --> G;
Architectural Patterns

Serverless Architecture: Using AWS Lambda for backend logic.

API Gateway Pattern: Using Amazon API Gateway as a single entry point for all client requests.

Component-Based UI: Building the frontend with reusable components, following the IBM design language.

Repository Pattern (Data Access): Backend functions will access the database through a dedicated data access layer.

Tech Stack
Category	Technology	Version	Purpose	Rationale
Frontend Language	TypeScript	~5.3.3	Main language for UI development	Provides strong typing to reduce errors.
Frontend Framework	Next.js (React)	~14.1.0	Framework for building the user interface	High performance and great developer experience.
UI Component Library	IBM Carbon Design	~11.0	Pre-built UI components	Directly implements the PRD requirement.
Backend Language	TypeScript	~5.3.3	Main language for AWS Lambda functions	Keeps the language consistent across the stack.
Backend Framework	AWS CDK	~2.127.0	Infrastructure as Code framework	Allows defining cloud architecture in TypeScript.
API Style	REST	(via API Gateway)	Defines client-server communication	A well-understood and standard approach.
Database	Amazon DynamoDB	(N/A)	Primary database for application data	Serverless NoSQL database that pairs with Lambda.
Authentication	AWS Cognito	(N/A)	Manages user sign-in and security	Secure, managed service for authentication.
Frontend Testing	Jest & RTL	~29.7.0	Unit and component testing	Industry standard for testing React/Next.js.
Backend Testing	Jest	~29.7.0	Unit testing for Lambda functions	Keeps testing framework consistent.
E2E Testing	Playwright	~1.41.2	Full application workflow testing	Modern and powerful end-to-end testing tool.
Data Models
Employee

Purpose: Represents a factory employee who can be a patient at the on-site clinic.

TypeScript Interface:

TypeScript
interface Employee {
  id: string;
  rfidTag: string;
  name: string;
  department: string;
  latestLeadLevel?: number;
  createdAt: Date;
}
Relationships: An Employee can have many Visits.

Visit

Purpose: Represents a single visit by an employee to the factory clinic.

TypeScript Interface:

TypeScript
interface Visit {
  id: string;
  employeeId: string;
  timestamp: Date;
  reasonForVisit: string;
  vitals?: { bloodPressure?: string; temperature?: number; };
  treatmentNotes?: string;
  createdAt: Date;
}
Relationships: A Visit belongs to one Employee.

API Specification
The API will expose the following main endpoints:

GET /employees/{rfid}: Retrieves an employee's profile by their RFID tag.

POST /visits: Creates a new visit record for an employee.

GET /employees/{employeeId}/visits: Retrieves the list of all past visits for a specific employee.

GET /reports/statistics: Retrieves aggregated data for the management dashboard.

GET /reports/recommendations: Retrieves actionable recommendations for management.

Components
Frontend Application (Web UI): Provides the user interface for staff and managers.

API Gateway: The single, secure entry point for all API requests.

Visit Management Service: Lambda functions handling the core clinic workflow.

Reporting Service: Lambda functions for data analysis for the dashboard and reports.

Data Import Service: A scheduled Lambda function to process the health data Excel file from S3.

Database: Amazon DynamoDB providing persistent storage.

External APIs
Based on our requirements, the application does not need to connect to any third-party external APIs.

Core Workflows
New Patient Visit

Code snippet
sequenceDiagram
    participant Nurse as Nurse (User)
    participant WebApp as Web Application (Browser)
    participant APIGW as API Gateway
    participant VisitSvc as Visit Management Service (Lambda)
    participant DB as Database (DynamoDB)

    Nurse->>+WebApp: 1. Taps Employee RFID Card
    WebApp->>+APIGW: 2. GET /employees/{rfid}
    APIGW->>+VisitSvc: 3. Invoke GetEmployee function
    VisitSvc->>+DB: 4. Query for employee by rfidTag
    DB-->>-VisitSvc: 5. Return Employee data
    VisitSvc-->>-APIGW: 6. Return Employee profile
    APIGW-->>-WebApp: 7. Employee profile data
    WebApp-->>-Nurse: 8. Display Employee Profile & Visit Form
    Nurse->>+WebApp: 9. Enters visit details and clicks Save
    WebApp->>+APIGW: 10. POST /visits with visit data
    APIGW->>+VisitSvc: 11. Invoke CreateVisit function
    VisitSvc->>+DB: 12. Save new visit record
    DB-->>-VisitSvc: 13. Confirm save
    VisitSvc-->>-APIGW: 14. Return success confirmation
    APIGW-->>-WebApp: 15. Success confirmation
    WebApp-->>-Nurse: 16. Show "Visit Saved" message
Database Schema
We will use a single-table design in Amazon DynamoDB for performance and scalability.

Employee Record:

PK: EMP#<employee_id>

SK: PROFILE

Visit Record:

PK: EMP#<employee_id>

SK: VISIT#<timestamp>

Frontend Architecture
Component Architecture

Folder Structure: Components will be organized into /ui, /common, and /features directories.

Component Template: All components will follow a standard React functional component template with TypeScript props.

State Management Architecture

Library: We will use Zustand for its simplicity and performance.

Structure: State will be organized into feature-specific stores (e.g., useVisitStore.ts).

Routing Architecture

System: We will use the file-based routing provided by the Next.js framework.

Security: A withAuth wrapper (Higher-Order Component) will be used to protect sensitive pages.

Frontend Services Layer

Library: We will use Axios for all API communication.

Pattern: A dedicated service layer will abstract all API calls, keeping components clean.

Backend Architecture
Service Architecture

Pattern: We will use a Serverless architecture with AWS Lambda.

Organization: Lambda handlers will be organized by resource and will call separate business logic services.

Database Architecture

Schema: The approved single-table design in DynamoDB will be used.

Access Pattern: The Repository Pattern will be used to abstract all database interactions.

Authentication and Authorization Architecture

Flow: We will use AWS Cognito federated with Microsoft 365 (Entra ID) for Single Sign-On (SSO).

Authorization: A Lambda Authorizer will secure all protected API endpoints.

Unified Project Structure
Plaintext
/factory-clinic-app/
├── /apps/
│   ├── /api/
│   └── /web/
├── /packages/
│   └── /shared/
├── /infrastructure/
└── package.json
Development Workflow
Prerequisites: Node.js, Git, AWS CLI.

Setup: npm install.

Commands: npm run dev, npm run test.

Environment Configuration
Environment variables will be used for both frontend and backend to manage configuration for API URLs, Cognito IDs, and database table names.

Deployment Architecture
Strategy: A CI/CD pipeline using GitHub Actions will deploy the frontend to AWS S3/CloudFront and the backend to AWS Lambda via the AWS CDK.

Environments: We will use Development, Staging, and Production environments.

Security and Performance
Security: All communication will be over HTTPS. The system will be designed to be compliant with Thailand's PDPA. User authentication will be handled by AWS Cognito with Microsoft 365 SSO.

Performance: The application will be optimized for speed using serverless functions, a CDN (CloudFront), and Next.js performance features.

Testing Strategy
The Full Testing Pyramid (Unit, Integration, E2E) will be implemented. Tests will be co-located with the source code and run automatically in our CI/CD pipeline.

Coding Standards
A set of critical rules and naming conventions will be enforced to ensure code quality and consistency, including the mandatory use of shared types and service layers.

Error Handling Strategy
A unified error handling strategy will be used. The backend will return a standard JSON error format, and the frontend will display user-friendly notifications in Thai while logging technical details.

Monitoring and Observability
We will use Amazon CloudWatch for backend monitoring, logging, and alerting, and CloudWatch RUM for real-user monitoring of the frontend application.

