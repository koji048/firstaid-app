# Branch Protection Rules

## Main Branch Protection

Configure the following branch protection rules for the `main` branch in GitHub repository settings:

### Required Settings

1. **Require a pull request before merging**

   - Require approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from CODEOWNERS (optional)

2. **Require status checks to pass before merging**

   - Require branches to be up to date before merging
   - Status checks required:
     - `Code Quality`
     - `Security Scan`
     - `iOS Build / Build iOS`
     - `Android Build / Build Android`

3. **Require conversation resolution before merging**

   - All PR comments must be resolved

4. **Include administrators**

   - Apply rules to administrators as well

5. **Restrict who can push to matching branches** (optional)
   - Specify users/teams who can push

### Additional Settings

- **Allow force pushes**: Disabled
- **Allow deletions**: Disabled
- **Require linear history**: Enabled (optional)
- **Require deployments to succeed**: Configure for production environments

## Develop Branch Protection

For the `develop` branch, use similar but less restrictive rules:

1. **Require a pull request before merging**

   - No approval required (or 1 approval for larger teams)

2. **Require status checks to pass before merging**
   - Status checks required:
     - `Code Quality`
     - `iOS Build / Build iOS`
     - `Android Build / Build Android`

## Feature Branch Naming Convention

Enforce branch naming conventions:

- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency fixes
- `chore/*` - Maintenance tasks
- `docs/*` - Documentation updates

## Setting Up CODEOWNERS

Create a `.github/CODEOWNERS` file:

```
# Global owners
* @team/mobile-developers

# Documentation
/docs/ @team/technical-writers @team/mobile-developers

# CI/CD
/.github/ @team/devops @team/mobile-developers

# Core app code
/src/ @team/senior-developers
```
