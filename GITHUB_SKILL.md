# Repolyx GitHub Engineering Workflow

## Goal

Build Repolyx like a real modern software engineering product.

The repository should:

* look professional
* stay organized
* scale properly
* follow real industry workflow
* remain beginner-friendly and understandable

---

# Core Development Rules

## 1. Never Push Directly to Main

`main` branch must always stay stable and clean.

Only tested code should go into `main`.

---

# Branch Workflow

## Create Feature Branches

Each module gets its own branch.

Example:

```bash
git checkout -b feature/github-auth
```

Examples:

```txt
feature/project-setup
feature/github-auth
feature/database
feature/repository-system
feature/ai-chat
feature/pr-review
feature/docs-generator
feature/activity-system
feature/settings
feature/overview
```

---

# Development Flow

## Standard Workflow

### 1. Create branch

```bash
git checkout -b feature/module-name
```

### 2. Build module

* keep code modular
* avoid unnecessary complexity
* use understandable naming
* maintain scalable structure

### 3. Test properly

Before pushing:

* check routes
* check errors
* test API flow
* validate environment variables

### 4. Commit properly

```bash
git add .
git commit -m "feat: add github oauth authentication"
```

### 5. Push branch

```bash
git push origin feature/github-auth
```

### 6. Merge after testing

Only merge stable code into `main`.

---

# Commit Message Standards

## Good Examples

```txt
feat: add github oauth
fix: resolve session middleware issue
refactor: improve auth architecture
ui: redesign dashboard layout
docs: update backend setup guide
```

## Bad Examples

```txt
updated
done
new changes
final code
working
```

---

# Backend Engineering Rules

## Architecture Goals

The backend must be:

* modular
* secure
* scalable
* understandable
* beginner-friendly
* production-ready

Avoid:

* overengineering
* unnecessary abstractions
* unnecessary AI agents
* complex architecture too early

---

# Backend Folder Structure

```txt
server/
 ├── src/
 │    ├── config/
 │    ├── controllers/
 │    ├── routes/
 │    ├── middleware/
 │    ├── services/
 │    ├── validators/
 │    ├── utils/
 │    ├── database/
 │    ├── modules/
 │    ├── types/
 │    ├── app.js
 │    └── server.js
 │
 ├── prisma/
 ├── .env
 ├── .env.example
 ├── package.json
 └── README.md
```

---

# Frontend Engineering Rules

Frontend should feel like:

* real software product
* modern engineering dashboard
* clean and minimal
* functional first
* user-friendly

Avoid:

* messy layouts
* too many cards
* unnecessary animations
* random gradients
* fake futuristic UI

Focus on:

* spacing
* hierarchy
* usability
* readability
* consistency

---

# UI/UX Rules

## Dashboard Philosophy

Every page should:

* have one clear purpose
* guide the user naturally
* reduce visual noise
* focus on workflow

---

# Animation Rules

Use:

* subtle glow
* soft transitions
* smooth hover states
* lightweight background motion

Avoid:

* heavy animations
* excessive floating effects
* distracting movement
* gaming-style UI

---

# GitHub Standards

Repository must include:

```txt
README.md
LICENSE
.env.example
.gitignore
CONTRIBUTING.md
```

---

# README Structure

README should contain:

* project overview
* features
* screenshots
* setup guide
* environment setup
* scripts
* tech stack
* folder structure
* roadmap

---

# Code Standards

## Always

* modular functions
* reusable logic
* proper naming
* clean imports
* proper error handling
* organized files

## Avoid

* giant files
* duplicated logic
* random utilities
* unnecessary comments
* deeply nested code

---

# AI Development Rules

AI should assist development.

AI should NOT control architecture blindly.

Use AI for:

* acceleration
* debugging
* UI improvements
* repetitive tasks
* documentation

Learn manually:

* backend logic
* authentication
* API architecture
* database relationships
* middleware flow

---

# Repolyx Product Direction

Repolyx is:

* an AI-native engineering workspace
* focused on GitHub repository intelligence
* designed like a real developer tool
* modern but minimal
* powerful but understandable

The product should feel like:

* GitHub
* Linear
* Vercel
* Notion
* Cursor

NOT like:

* flashy AI demo projects
* random futuristic dashboards
* overcomplicated admin panels

---

# Final Engineering Goal

Build Repolyx like a real engineering product that:

* recruiters respect
* engineers understand
* users enjoy using
* scales professionally
* demonstrates real software engineering skills
