# Git Branching Guidelines

## Branch Naming Convention

### Format
```
<type>/<description>
```

### Types
- **feat**: New features or functionality
- **fix**: Bug fixes
- **refactor**: Code refactoring without changing functionality
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **docs**: Documentation changes
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Maintenance tasks

### Scopes
- **admin**: Admin panel features
- **hackathon**: Hackathon-related features
- **user**: User management
- **auth**: Authentication
- **ui**: UI components and styling
- **shared**: Shared utilities/models
- **api**: API integrations
- **core**: Core application functionality

### Description Rules
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Maximum 50 characters
- No special characters except hyphens

## Branch Examples

### Good Examples
```
feat/hackathon-track-sorting
fix/auth-login-redirect-issue
refactor/form-validation-toaster
style/button-spacing-consistency
perf/dashboard-loading-optimization
test/user-registration-flow
docs/api-endpoint-documentation
```

### Bad Examples
```
feature/new-stuff (too vague, wrong type)
fix-bug (missing slash separator)
UpdateUserProfile (wrong case)
feat/hackathon_new_feature (underscore instead of hyphen)
```

## Base Branch Strategy

### Main Branches
- **release/test**: Testing environment
- **release/production**: Development integration

### Branch Creation Rules
1. **Always create from release/test** unless specified otherwise
2. **Never create directly from main**
3. **Pull latest changes** before creating new branch

### Commands
```bash
# Standard branch creation
git checkout release/test
git pull origin release/test
git checkout -b <type>/<description>

# Example
git checkout release/test
git pull origin release/test
git checkout -b refactor/form-submit-button-enhancement
```

## Branch Lifecycle

### 1. Creation
- Create from release/test
- Use proper naming convention
- Ensure clean working directory

### 2. Development
- Make atomic commits
- Follow commit message guidelines
- Keep branch focused on single feature/fix

### 3. Push
```bash
# First push
git push -u origin <branch-name>

# Subsequent pushes
git push
```

### 4. Pull Request
- Target release/test branch
- Use descriptive PR title
- Include proper description
- Request appropriate reviewers

### 5. Cleanup
```bash
# After merge, delete local branch
git branch -d <branch-name>

# Delete remote branch (if not auto-deleted)
git push origin --delete <branch-name>
```

## Special Cases

### Hotfixes
```
hotfix/<description>
```
- Create from main
- Merge to both main and release/test

### Release Branches
```
release/v<version>
```
- Create from release/test
- Merge to main after testing

### Experimental Features
```
experiment/<description>
```
- Long-running feature branches
- Regular rebasing required

## Branch Protection Rules

### Protected Branches
- main
- release/test
- develop

### Requirements
- No direct pushes
- Pull request required
- At least 1 reviewer approval
- Status checks must pass
- Branch must be up to date

## Best Practices

### Do's
- Keep branches small and focused
- Use descriptive names
- Delete merged branches
- Rebase before merging if needed
- Test locally before pushing

### Don'ts
- Don't use generic names
- Don't create long-running feature branches
- Don't push directly to protected branches
- Don't use special characters in names
- Don't create branches from outdated base

## Troubleshooting

### Common Issues
1. **Branch already exists**: Use different name or delete old branch
2. **Push rejected**: Pull latest changes and resolve conflicts
3. **Wrong base branch**: Create new branch from correct base

### Recovery Commands
```bash
# Delete local branch
git branch -D <branch-name>

# Reset to remote state
git reset --hard origin/<branch-name>

# Change base branch
git rebase --onto <new-base> <old-base> <branch-name>
```