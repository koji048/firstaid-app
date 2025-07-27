Factory Hospital Room Application Product Requirements Document (PRD)
Goals and Background Context

Goals

To replace the inefficient, paper-based patient logging system with a streamlined digital workflow.

To provide data-driven insights into employee health and safety, with a specific focus on analyzing the correlation with lead exposure.

To enable timely, accurate, and automated reporting for factory management to support proactive decision-making.

Background Context

The factory currently relies on a manual, paper-based system for managing its hospital room. This process hinders the ability to analyze health data efficiently, creating a significant blind spot in occupational health and safety monitoring.

This document outlines the requirements for a new digital application that will address these challenges. The application will feature a fast, RFID-enabled, Thai-language interface for data collection and an integrated reporting module for management. The goal is to transform the factory's health monitoring from a reactive process into a proactive, data-driven program.

Change Log

Date Version Description Author
2025-07-25 1.0 Initial PRD draft created from Project Brief. John (PM)
Requirements

Functional

FR1: The system must identify an employee by reading their existing RFID employee card.

FR2: The system must allow staff to log a "Reason for Visit" by either selecting from a pre-defined list of common symptoms or entering custom text.

FR3: The system must automatically display an employee's latest lead level data on their profile, sourced from the integrated annual health dataset (Excel file).

FR4: The system must provide a live dashboard for management to view key statistics, concerns, and improvements.

FR5: The system must have the capability to generate a monthly incident report.

FR6: The system should analyze collected data to provide actionable recommendations to management.

Non-Functional

NFR1: The entire user interface must be in the Thai language.

NFR2: The application must be responsive and fully functional on desktop, tablet, and mobile devices.

NFR3: The application's performance must be fast and responsive, in line with modern SaaS standards.

NFR4: The application must be fully compliant with Thailand's Personal Data Protection Act (PDPA) for handling sensitive health data.

NFR5: The application's backend infrastructure must be hosted on AWS Cloud.

User Interface Design Goals

Overall UX Vision

The user experience must be extremely simple, fast, and error-proof. The design should prioritize speed and clarity for a busy nurse who may be under pressure. The entire experience must feel intuitive to a native Thai speaker.

Key Interaction Paradigms

The primary interaction will be "tap and select." The workflow will be initiated by a physical action (tapping an RFID card), followed by selections from clear, pre-defined lists, with free-text typing used as a secondary option, not the primary one.

Core Screens and Views

Conceptually, the application will be built around these key views:

Check-in Screen: An initial screen prompting the nurse to tap the employee's RFID card.

Patient Visit Screen: The main screen for logging a new visit, showing the patient's details, lead level, and fields for data entry.

Patient History View: A simple view to see a list of an employee's past visits.

Management Dashboard: A read-only view for managers displaying key charts and statistics.

Accessibility: WCAG AA

The application should meet the WCAG 2.1 AA accessibility standard.

Branding

The visual design should be inspired by the IBM Carbon Design System (ibm.com). The style should be clean, professional, and utilitarian, with a focus on clarity and ease of use. The color palette should be simple, using blues, whites, and grays.

Target Device and Platforms: Web Responsive

The application will be a responsive web application, designed to be fully functional on desktops, tablets, and mobile phones.

Technical Assumptions

Repository Structure: Monorepo.

Service Architecture: To be recommended by the Architect (e.g., Monolith, Microservices, or Serverless).

Testing Requirements: Full Testing Pyramid (Unit, Integration, and End-to-End testing).

Epic List

Epic 1: Foundation & Core Visit Logging

Goal: Establish the project's technical foundation on AWS and deliver the core MVP workflow, allowing clinic staff to check-in employees via RFID and log the reason for their visit.

Epic 2: Management Reporting & Dashboard

Goal: Empower the management team with insights by delivering the live dashboard and the automated monthly reporting features.

Epic 3: Advanced Health Tracking & Analytics

Goal: Enhance the application's capabilities by adding detailed vitals tracking, treatment logging, and the intelligent "Actionable Recommendations" engine.

Epic 1: Foundation & Core Visit Logging

Expanded Goal: The objective of this epic is to establish the complete technical foundation for the application and deliver the core, end-to-end workflow for the clinic staff. By the end of this epic, the essential paper-based workflow for patient check-in and visit logging will be fully replaced.

Story 1.1: Project & Repository Setup

As a Developer, I want a new monorepo with the basic frontend and backend project structures set up, so that I have a foundation to start building features.
Acceptance Criteria:

A new monorepo is created and configured.

A placeholder backend service is created within the monorepo.

A placeholder frontend application is created within the monorepo.

The project is configured to support the Thai language from the beginning.

Story 1.2: Database Schema & Connection

As a Developer, I want the initial database schema for patients and visits to be created and connected to the backend, so that we can store and retrieve application data.
Acceptance Criteria:

The initial database tables/models for Employees and Visits are defined.

The backend service can successfully connect to the database.

The service has basic functions to read and write to the new tables.

Story 1.3: Employee Check-in via RFID

As a Nurse, I want to tap an employee's RFID card to instantly open their profile, so that the check-in process is fast and error-free.
Acceptance Criteria:

The application's main screen is ready to receive input from an RFID reader.

When a valid RFID is read, the system correctly identifies the corresponding employee from the database.

The application navigates to a patient-specific screen showing the employee's name and basic details.

Story 1.4: Display Lead Level from Health Dataset

As a Nurse, I want to see the employee's latest lead level displayed on their profile, so that I have immediate context about their potential health risks.
Acceptance Criteria:

When an employee's profile is loaded, the system reads from the integrated Excel health dataset.

The employee's most recent lead level from the dataset is clearly displayed on their profile screen.

If no lead level data is found, a "Data Not Available" message is displayed.

Story 1.5: Log Reason for Visit

As a Nurse, I want to log the reason for an employee's visit by selecting from a list or typing a custom note, so that the visit is accurately recorded.
Acceptance Criteria:

The visit logging interface is present on the employee's screen.

The nurse can select one or more symptoms from a pre-defined list.

The nurse can select an "Other" option, which allows them to type a custom note.

Submitting the log successfully saves a new visit record to the database.

Epic 2: Management Reporting & Dashboard

Expanded Goal: The objective of this epic is to build the features that provide value to the factory management team. By the end of this epic, managers will have access to a real-time health dashboard and on-demand monthly reports, enabling them to make data-driven health and safety decisions.

Story 2.1: Create Reporting Data API

As a Developer, I want secure API endpoints that provide aggregated visit data, so that the frontend dashboard can display the required statistics.
Acceptance Criteria:

An API endpoint is created that returns key statistics for a given time period.

An API endpoint is created that returns a list of the most frequently logged symptoms.

The endpoints are secure and can only be accessed by users with a "Manager" role.

Story 2.2: Management Dashboard UI

As a Manager, I want a dedicated dashboard page within the application, so that I have a central place to view clinic activity and health trends.
Acceptance Criteria:

A new, secure "Dashboard" page is created, accessible only to "Manager" roles.

The page layout is clean, professional, and inspired by the IBM design system.

The page includes a date range filter.

Story 2.3: Display Live Statistics on Dashboard

As a Manager, I want to see live charts and statistics on the dashboard, so that I can understand real-time health trends at a glance.
Acceptance Criteria:

The dashboard widgets successfully call the reporting APIs.

Widgets display key statistics (e.g., total visits, top symptoms, visits by department).

The data on the dashboard updates when the date range filter is changed.

Story 2.4: Generate Monthly PDF Report

As a Manager, I want to download a PDF of the monthly clinic report, so that I can easily share it or archive it.
Acceptance Criteria:

A "Download Report" button is present on the dashboard.

When clicked, the system generates a professional-looking PDF containing the key dashboard statistics.

The generated PDF is downloaded to the user's computer.

Epic 3: Advanced Health Tracking & Analytics

Expanded Goal: The objective of this epic is to significantly enhance the application's data collection and analysis capabilities. By the end of this epic, the clinic staff will be able to record more detailed patient information, and the system will provide intelligent recommendations to management.

Story 3.1: Record Detailed Patient Vitals

As a Nurse, I want to record an employee's blood pressure and temperature during a visit, so that I can maintain a more complete health record.
Acceptance Criteria:

The "Log Visit" interface is updated to include optional fields for Blood Pressure and Temperature.

The entered values are correctly saved with the visit record.

The saved vitals are visible when viewing a past visit's details.

Story 3.2: Log Treatment and Medication Given

As a Nurse, I want to log the treatment or medication I provided during a visit, so that there is a clear record of actions taken.
Acceptance Criteria:

The "Log Visit" interface is updated to include an optional text field for Treatment/Medication Given.

The entered text is correctly saved with the visit record.

The saved treatment information is visible when viewing a past visit's details.

Story 3.3: Develop Data Analysis for Recommendations

As a Developer, I want a backend service that analyzes health data to identify trends, so that it can generate recommendations for management.
Acceptance Criteria:

A new backend service is created that can process historical visit data.

The service implements logic to identify basic patterns.

The service exposes a secure API endpoint that returns a list of generated insights or alerts.

Story 3.4: Display Actionable Recommendations

As a Manager, I want to see a list of actionable recommendations on my dashboard, so that I can be guided on where to focus my health and safety efforts.
Acceptance Criteria:

A new "Actionable Recommendations" widget is added to the Management Dashboard.

The widget calls the recommendations API endpoint.

It clearly displays the list of generated recommendations.
