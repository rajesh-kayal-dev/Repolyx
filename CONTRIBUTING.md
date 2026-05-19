# Contributing to Repolyx 🤝

First off, thank you for considering contributing to Repolyx! It is people like you who make the open-source community an amazing place to learn, inspire, and create.

---

## 🧭 Code of Conduct

Please be respectful, professional, and inclusive when communicating with other contributors and maintaining the repository.

---

## 🛠️ How to Contribute

### 1. Finding or Creating an Issue
- Before starting any development, check existing issues.
- If no issue exists for your feature request or bug report, please open a new issue using our issue templates.

### 2. Forking and Branch Configuration
- Fork the repository to your own account.
- Create a feature or bugfix branch naming it descriptively:
  - For features: `feature/short-description`
  - For bugfixes: `bugfix/short-description`

### 3. Coding Guidelines
- **Frameworks & Languages**: Next.js (TypeScript) on frontend, Express (JavaScript ESM) on backend.
- **Environment Management**: Environment variables must be validated using Zod (server) or our central parser (client).
- **ORM & DB**: Prisma must use `prisma-client-js` and standard models. Run `npx prisma generate` after schema edits.
- **Git Commit Messages**: Use semantic, clear messages:
  - `feat: add workspace analytics page`
  - `fix: middleware registration ordering in app.js`
  - `docs: update setup steps in readme`

### 4. Submitting a Pull Request
- Create a PR against the `main` branch.
- Fill out the PR template completely.
- Ensure all tests pass and there are no linting warnings/errors.
- Link your PR to the related issue (e.g. `Closes #12`).

---

## 🚀 Development Standards

- Keep routes, controllers, middleware, and business logic cleanly separated.
- Use async/await handles inside controllers with clean error handling using the centralized `errorHandler` middleware.
- Always include an `.env.example` update if you introduce new environment keys.
