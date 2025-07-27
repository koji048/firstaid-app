# Unified Project Structure

```plaintext
first-aid-room-app/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       ├── deploy-staging.yaml
│       └── deploy-production.yaml
├── apps/                       # Application packages
│   ├── mobile/                 # React Native app
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # Navigation setup
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API client services
│   │   │   ├── store/          # Redux store
│   │   │   ├── styles/         # Global styles/themes
│   │   │   └── utils/          # Frontend utilities
│   │   ├── android/            # Android specific
│   │   ├── ios/                # iOS specific
│   │   ├── assets/             # Images, fonts
│   │   ├── __tests__/          # Frontend tests
│   │   └── package.json
│   └── api/                    # Backend Lambda functions
│       ├── src/
│       │   ├── functions/      # Lambda handlers
│       │   ├── middleware/     # Express middleware
│       │   ├── repositories/   # Data access layer
│       │   ├── services/       # Business logic
│       │   ├── utils/          # Backend utilities
│       │   └── types/          # Backend types
│       ├── tests/              # Backend tests
│       └── package.json
├── packages/                   # Shared packages
│   ├── shared/                 # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── constants/      # Shared constants
│   │   │   ├── validators/     # Shared validation
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       ├── typescript/
│       └── jest/
├── infrastructure/             # IaC definitions
│   ├── cdk/                    # AWS CDK
│   │   ├── lib/
│   │   │   ├── stacks/
│   │   │   └── constructs/
│   │   └── bin/
│   └── scripts/                # Deploy scripts
├── docs/                       # Documentation
│   ├── prd.md
│   ├── architecture.md
│   └── api/                    # API docs
├── scripts/                    # Build/utility scripts
│   ├── setup.sh
│   ├── build.sh
│   └── deploy.sh
├── .env.example                # Environment template
├── nx.json                     # Nx configuration
├── package.json                # Root package.json
├── tsconfig.base.json          # Base TypeScript config
└── README.md
```
