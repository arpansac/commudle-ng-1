# Contributing to Commudle

We're building the world's largest platform for Tech Communities and every contribution matters.

This is the front end of the platform and is based on Angular 2+ (we keep updating to the latest version fast)

Though we'd like to keep it informal, but here's some guidelines to keep in mind while contributing

### Creating an Issue

An issue can be created for the following

- Reporting a bug
- Proposing a new feature or a fix
- Proposing a better coding strategy

We use github to host code, to track issues and feature requests, as well as accept pull requests.

### Submitting a Pull Request

Pull requests are the best way to propose changes to the codebase (we use Github Flow). We actively welcome your pull
requests.

### The instructions to setup the repository in a local environment are mentioned in the [ReadMe](README.md)


#### Branch Naming Conventions

Follow these modern branch naming conventions to keep the repository organized and collaboration clear:

- **feature/**: For new feature development. Example: `feature/awesome-login`
- **hotfix/**: For urgent production fixes. Example: `hotfix/logout-issue`
- **bugfix/**: For fixes to the develop branch (non-urgent). Example: `bugfix/login-error`

Replace the part after the slash with a short, descriptive name for your branch. Use hyphens to separate words.

These conventions help clarify the purpose of each branch and make collaboration easier.

#### Git Commit
- `chmod ug+x .husky/*`
- `git add CONTRIBUTING.md`
- `git commit -m "docs(contributing): update contributing.md for git commit"`
  
In general the commit pattern mostly looks like this:
- type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")

Common types according to [commitlint-config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum) (based on the Angular convention) can be:

- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
- ci: Changes to our CI configuration files and scripts (example scopes: Circle, BrowserStack, SauceLabs)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- revert:Commit reverts a previous commit
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests

#### Extra Guidelines

- Comment on the issue by introducing yourself and asking to solve it
- For complicated issues, brainstorming with some screenshots will be needed from both sides so that the maintainers and
  you, both are on the same line of thought
- Keep a consistent coding style
- Ensure your PR mentions which issue it is closing
- Always feel free to reach out for help in comments

By contributing, you agree that your contributions will be licensed under its MIT License.

![Commudle Logo](https://commudle.com/assets/images/commudle-logo152.png)
