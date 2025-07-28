# First Aid Room App

[![Main CI/CD Pipeline](https://github.com/[username]/first-aid-room-app/actions/workflows/main.yml/badge.svg)](https://github.com/[username]/first-aid-room-app/actions/workflows/main.yml)
[![iOS Build](https://github.com/[username]/first-aid-room-app/actions/workflows/ios.yml/badge.svg)](https://github.com/[username]/first-aid-room-app/actions/workflows/ios.yml)
[![Android Build](https://github.com/[username]/first-aid-room-app/actions/workflows/android.yml/badge.svg)](https://github.com/[username]/first-aid-room-app/actions/workflows/android.yml)

A comprehensive mobile application providing instant access to first aid guidance, emergency contacts, and medical information when you need it most.

## Features

### Implemented

- 📇 **Emergency Contacts Management**: Add, edit, and organize emergency contacts with categories (Family, Medical, Work)
  - Search functionality with real-time filtering
  - Primary contact designation
  - Phone number formatting and validation
  - Secure encrypted storage

### Planned

- 📚 **First Aid Guides**: Step-by-step instructions for common medical emergencies
- 🚨 **Emergency Mode**: Quick access to emergency contacts and nearest hospitals
- 👤 **Medical Profile**: Store important medical information securely
- 📱 **Offline Support**: Access critical information without internet connection
- 🌍 **Multi-language**: Support for multiple languages

## Tech Stack

- **Frontend**: React Native 0.73+ with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: React Native Elements
- **Navigation**: React Navigation
- **Storage**: AsyncStorage & SQLite
- **Error Monitoring**: Sentry
- **Testing**: Jest & React Native Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- React Native development environment ([setup guide](docs/development/setup-guide.md))
- For iOS: macOS with Xcode 14+
- For Android: Android Studio with JDK 11

### Installation

1. Clone the repository:

```bash
git clone https://github.com/[username]/first-aid-room-app.git
cd first-aid-room-app/firstaid-app
```

2. Install dependencies:

```bash
npm install
```

3. Install iOS dependencies (macOS only):

```bash
cd ios && pod install && cd ..
```

4. Create environment file:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the App

#### Development

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

#### Production Build

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Screen components
├── navigation/    # Navigation configuration
├── store/        # Redux store and slices
├── services/     # API and external services
├── storage/      # Local storage implementations
├── hooks/        # Custom React hooks
├── utils/        # Utility functions
├── types/        # TypeScript type definitions
└── styles/       # Global styles and theme
```

## Development

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): code formatting
refactor(scope): code refactoring
test(scope): add tests
chore(scope): maintenance
```

### Documentation

- [Development Setup](docs/development/setup-guide.md)
- [Architecture Overview](docs/architecture.md)
- [Component Guidelines](docs/development/component-guidelines.md)
- [Testing Conventions](docs/development/testing-conventions.md)
- [Code Quality Standards](docs/development/code-quality.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests (Detox)
npm run e2e:ios
npm run e2e:android
```

## Deployment

The app uses GitHub Actions for CI/CD:

- **Pull Requests**: Run tests, linting, and build checks
- **Main Branch**: Deploy to staging environment
- **Release Tags**: Deploy to production

See [CI/CD Documentation](.github/workflows/README.md) for details.

## Security

- All sensitive data is encrypted at rest
- API communication uses HTTPS only
- User authentication via secure tokens
- Medical data is stored locally only

Report security vulnerabilities to: security@[domain].com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@[domain].com
- 📖 Documentation: [docs.firstaidroom.app](https://docs.firstaidroom.app)
- 🐛 Issues: [GitHub Issues](https://github.com/[username]/first-aid-room-app/issues)

## Acknowledgments

- Medical content reviewed by healthcare professionals
- Icons from [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- UI components from [React Native Elements](https://reactnativeelements.com/)

---

Made with ❤️ by the First Aid Room Team
