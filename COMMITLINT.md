# Commitlint Configuration

This document explains the commitlint configuration in `.commitlintrc.json`.

## Configuration Structure

### Extends
- Uses `@commitlint/config-conventional` as the base configuration
- Provides standard conventional commit rules

### Rules

#### type-enum
- **Format**: `[level, condition, value]`
- **Level**: `2` (Error - will fail commit if violated)
- **Condition**: `"always"` (Rule is always enforced)

#### Allowed Commit Types

| Type | Description |
|------|-------------|
| `feat` | New features or functionality |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code refactoring without changing functionality |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance tasks |
| `revert` | Reverts a previous commit |
| `hotfix` | Critical fixes for production (custom addition) |

## Rule Levels
- `0` = Disabled
- `1` = Warning (won't fail commit)
- `2` = Error (will fail commit)

## Rule Conditions
- `"always"` = Rule must be satisfied
- `"never"` = Rule must not be satisfied

## Additional Rules (Available for Future Use)

```json
{
  "scope-enum": [2, "always", ["admin", "hackathon", "user", "auth", "ui", "shared", "api", "core"]],
  "subject-case": [2, "always", "lower-case"],
  "subject-max-length": [2, "always", 50],
  "header-max-length": [2, "always", 72],
  "body-leading-blank": [2, "always"],
  "footer-leading-blank": [2, "always"]
}
```

## Examples

### Valid Commits
- `feat(auth): add login functionality`
- `fix(ui): resolve button alignment issue`
- `hotfix(api): fix critical security vulnerability`
- `docs: update API documentation`

### Invalid Commits
- `update stuff` (invalid type)
- `feature: new login` (should be `feat`)
- `Fix: button issue` (type should be lowercase)

## Related Files
- `.commitlintrc.json` - Main configuration