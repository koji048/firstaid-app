# Code Quality Guidelines

## Overview

This project enforces code quality through automated tools and conventions to ensure maintainable, consistent, and high-quality code.

## Tools

### ESLint

- **Purpose**: JavaScript/TypeScript linting
- **Config**: `.eslintrc.js`
- **Run**: `npm run lint`
- **Auto-fix**: `npm run lint -- --fix`

### Prettier

- **Purpose**: Code formatting
- **Config**: `.prettierrc.js`
- **Run**: `npm run format`
- **Check**: `npm run format:check`

### TypeScript

- **Purpose**: Type checking
- **Config**: `tsconfig.json`
- **Run**: `npm run typecheck`

### Husky

- **Purpose**: Git hooks
- **Hooks**:
  - `pre-commit`: Runs lint-staged
  - `commit-msg`: Validates commit message format

## Code Style Rules

### TypeScript

- Use strict mode
- Avoid `any` types
- Define interfaces for all props
- Use type inference where possible
- Export types separately from implementations

### React/React Native

- Use functional components with hooks
- Use `React.memo` for expensive components
- Always include `displayName` for debugging
- Include `testID` props for E2E testing

### Imports

- Sort imports automatically
- Group by: React → React Native → External → Internal → Relative
- Use module aliases (@components, @screens, etc.)

### File Organization

```
ComponentName/
├── ComponentName.tsx        # Implementation
├── ComponentName.styles.ts  # Styles
├── ComponentName.test.tsx   # Tests
└── index.ts                # Export
```

## Commit Message Format

Follow Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes
- `perf`: Performance improvements
- `build`: Build system changes
- `ci`: CI/CD changes
- `revert`: Revert previous commit

### Examples

```
feat(auth): add biometric authentication support
fix(navigation): resolve deep linking crash on Android
docs(readme): update installation instructions
chore(deps): upgrade React Native to 0.73
```

## Pre-commit Checks

Automatically runs on staged files:

1. ESLint with auto-fix
2. Prettier formatting
3. TypeScript compilation check

## CI/CD Checks

Pull requests must pass:

1. ESLint (no warnings)
2. Prettier formatting check
3. TypeScript compilation
4. Unit tests with coverage
5. Build for iOS and Android

## Best Practices

### General

1. Write self-documenting code
2. Keep functions small and focused
3. Use meaningful variable names
4. Add JSDoc comments for complex logic
5. Handle errors appropriately

### React Native Specific

1. Optimize for performance (use FlatList, memo, etc.)
2. Test on both iOS and Android
3. Consider different screen sizes
4. Handle offline scenarios
5. Minimize bundle size

### Testing

1. Write tests for new features
2. Maintain > 80% code coverage
3. Test edge cases
4. Use meaningful test descriptions
5. Mock external dependencies

## IDE Setup

### VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Running Quality Checks

```bash
# Run all checks
npm run lint && npm run typecheck && npm run test

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format

# Type check
npm run typecheck

# Run tests
npm test
```
