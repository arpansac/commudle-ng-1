# Git Commit Message Conventions

## Format

```
<type>(<scope>): <description>

```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Scopes

Use the component or module name:
- **admin**: Admin panel features
- **hackathon**: Hackathon-related features
- **user**: User management
- **auth**: Authentication
- **ui**: UI components
- **shared**: Shared utilities/models

## Rules

1. **Subject line (description)**:
   - Use imperative mood ("add" not "added" or "adds")
   - No capitalization of first letter
   - No period at the end
   - Maximum 50 characters

2. **Body** (optional):
   - Explain what and why, not how
   - Wrap at 72 characters
   - Separate from subject with blank line

3. **Breaking changes**:
   - Add "BREAKING CHANGE:" in the footer
   - Explain what changed and migration path

## Examples

### Good Examples
```
feat(hackathon): add track sorting functionality

fix(auth): resolve login redirect issue

style(ui): update button spacing consistency

docs: update API documentation for user endpoints
```

### Bad Examples
```
Fixed bug (too vague)
Added new feature for hackathon (not descriptive)
Update code (meaningless)
```

## Additional Guidelines

- Keep commits atomic (one logical change per commit)
- Test your changes before committing
- Use present tense, imperative mood
- Reference issues when applicable: "fixes #123"
- Avoid generic messages like "update", "fix", "change"