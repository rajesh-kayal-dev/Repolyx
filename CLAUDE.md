# Repolyx Developer Guidelines

Guidelines, commands, and patterns for development in the Repolyx repository.

## Commands

- **Start backend (dev):** `cd server && npm run dev`
- **Start frontend (dev):** `cd client && npm run dev`
- **Install dependencies (client):** `cd client && npm install`
- **Install dependencies (server):** `cd server && npm install`
- **Generate Prisma client:** `cd server && npx prisma generate`
- **Deploy schema migrations:** `cd server && npx prisma db push`
- **Run Playwright tests:** `cd client && npx playwright test`
- **Run single Playwright test:** `cd client && npx playwright test tests/overview.spec.ts`

## Code Style & Architecture

### Backend (Express ESM)
- Use standard ES module syntax (`import`/`export`).
- Use Zod schemas for request body/query validation.
- Keep route handlers inside `controllers/`, routes inside `routes/`, and session logic/middleware inside `middleware/`.
- Handle errors gracefully and avoid throwing unhandled rejections.

### Frontend (Next.js TypeScript App Router)
- React 18 functional components with Tailwind CSS.
- Next.js App Router structure under `client/app/`.
- Separate reusable components into `client/components/`.
- Maintain a clean and responsive dark dashboard UI style (matching Linear/GitHub/Vercel).
- Mock out backend requests using Playwright `page.route` in end-to-end tests to prevent database dependency.

---

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage labels for 5 canonical triage states mapped to GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository configuration. See `docs/agents/domain.md`.
