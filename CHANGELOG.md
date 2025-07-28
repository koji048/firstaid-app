# Changelog

All notable changes to the First Aid Room App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-07-27

### Added

- **Emergency Contacts UI Implementation** (Story 1.3)
  - Complete contact management interface with add, edit, delete functionality
  - Real-time search with 300ms debouncing across name, phone, and notes
  - Contact categorization (Family, Medical, Work, Other) with color coding
  - Primary contact designation with visual indicator
  - Phone number formatting for US and international formats
  - Form validation using react-hook-form with comprehensive error handling
  - Empty state with helpful instructions and direct CTA
  - IBM-inspired design system with sharp corners and proper spacing
  - Pull-to-refresh functionality for contact list
  - Responsive design for both iOS and Android

### Technical

- Redux Toolkit integration for centralized search state management
- Component architecture following React Native best practices
- Comprehensive unit tests with React Native Testing Library
- Phone number validation utilities supporting international formats
- Encrypted storage integration from Story 1.2 data layer
- Performance optimizations with React.memo and proper hook usage

### Dependencies Added

- `react-hook-form` - Form validation and state management
- `@react-native-picker/picker` - Native dropdown components

### Testing

- Added unit tests for all emergency contact components
- Jest configuration updated for React Native dependencies
- Test coverage >80% for new components

## [1.2.0] - 2025-07-26

### Added

- **Emergency Contacts Data Model** (Story 1.2)
  - Redux Toolkit store implementation
  - Encrypted AsyncStorage integration
  - Contact CRUD operations with storage persistence
  - Migration system for data schema updates
  - TypeScript type definitions

## [1.1.0] - 2025-07-25

### Added

- Initial React Native app setup with core architecture
- Basic navigation structure with React Navigation
- Authentication scaffolding
- Project structure and build configuration
- CI/CD pipeline setup with GitHub Actions

## [1.0.0] - 2025-07-24

### Added

- Project initialization
- Documentation structure
- PRD and architecture specifications
- Development environment setup
