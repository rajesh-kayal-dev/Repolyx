# Repolyx MCP Server

## AI GitHub Workflow & Local Workspace Assistant

### Complete End-to-End MVP Plan

---

# What Is Repolyx MCP Server?

Repolyx MCP Server is a local AI workspace agent that connects:

```txt id="intro01"
User Local Project
        ↓
Repolyx MCP Server
        ↓
Repolyx AI Chat
        ↓
GitHub Workflow Assistant
```

Normally:

* AI chat cannot access local files
* browser cannot scan project folders
* cloud AI cannot run Git commands

The Repolyx MCP Server solves this safely.

---

# Main Goal

Help users:

* connect local projects
* validate repositories
* understand GitHub workflow
* detect issues before push
* create professional GitHub repositories
* follow industry-standard Git flow

WITHOUT automatically writing or changing user code.

---

# Core Philosophy

Repolyx should NOT:

* become autonomous AI coder
* silently edit files
* silently run commands
* silently push code

Instead:

```txt id="philosophy01"
AI Engineering Assistant
```

It:

* scans
* validates
* explains
* guides
* recommends
* asks approval

This is:

* safer
* beginner-friendly
* professional
* easier to trust

---

# What This Module Actually Does

---

# 1. Connect Local Workspace

User installs:

```bash id="install01"
npx repolyx-mcp
```

This starts a local server:

```txt id="install02"
localhost:3939
```

Now Repolyx AI Chat can communicate with the user's local machine safely.

---

# 2. Connect Project Folder

User clicks:

```txt id="ui01"
Connect Workspace
```

Browser opens folder picker.

Example:

```txt id="ui02"
/projects/my-app
```

User approves access.

Now MCP can:

* scan repository
* read files
* detect framework
* analyze structure
* check Git status

---

# 3. Connect GitHub

User clicks:

```txt id="ui03"
Connect GitHub
```

Then Repolyx opens guide.

---

# How User Gets GitHub Classic Token

Open:

[GitHub Personal Access Tokens](https://github.com/settings/tokens?utm_source=chatgpt.com)

Steps:

1. Click:

```txt id="git01"
Generate new token (classic)
```

2. Select permissions:

```txt id="git02"
repo
workflow
read:user
```

3. Copy token

4. Paste token into Repolyx MCP setup

---

# IMPORTANT SECURITY RULE

GitHub token:

* stored locally only
* encrypted locally
* NEVER stored in Repolyx cloud database
* NEVER exposed to AI model

---

# How Cloud Server Communicates With Local Machine

This is your biggest doubt.

The answer:

```txt id="arch01"
Browser
        ↓
localhost:3939
        ↓
Repolyx MCP Server
        ↓
Local Filesystem + Git
```

Your cloud AI NEVER directly accesses local machine.

Instead:

* browser talks to local MCP
* MCP reads repository
* MCP sends safe metadata
* AI analyzes metadata

This is exactly how:

* Cursor
* Claude MCP
* Cline
* OpenHands

work internally.

---

# Example Communication Flow

User says:

```txt id="flow01"
Push my project to GitHub
```

Flow:

```txt id="flow02"
AI Chat
        ↓
Local MCP checks repository
        ↓
MCP validates project
        ↓
MCP returns issues
        ↓
AI explains issues
        ↓
User fixes issues
        ↓
AI asks approval
        ↓
MCP pushes repository
```

---

# Before Push Validation System

VERY IMPORTANT FEATURE.

Before pushing:
Repolyx checks:

* TypeScript errors
* ESLint errors
* build errors
* missing README
* missing .gitignore
* missing .env.example
* node_modules included
* exposed secrets
* broken imports
* package issues

---

# Example Workflow

User:

```txt id="workflow01"
Push my project to GitHub
```

Repolyx:

```txt id="workflow02"
I found 4 issues before pushing:

- Missing README.md
- node_modules should not be committed
- TypeScript error in auth.ts
- Missing .env.example

Please fix these issues first.
```

Then:

```txt id="workflow03"
[ Show Files ]
[ Explain Issues ]
[ Continue Anyway ]
```

This is the core feature.

---

# README & Documentation Suggestions

If README missing:

AI says:

```txt id="readme01"
README.md not found.

Would you like to generate:
- project overview
- installation guide
- API documentation
- setup instructions?
```

Then AI generates professional markdown.

---

# GitHub Workflow Guidance

AI helps users:

* create repository
* create branch
* understand commits
* create PR
* follow GitHub flow

Example:

```txt id="gitflow01"
Would you like to:
- push to main branch
- create new feature branch?
```

---

# CI/CD GitHub Actions Suggestion

VERY strong feature.

Before push:

```txt id="cicd01"
Would you like to enable GitHub Actions CI/CD pipeline?
```

Then AI explains:

```txt id="cicd02"
This automatically checks:
- build errors
- lint issues
- TypeScript validation

whenever code is pushed to GitHub.
```

Then:
MCP creates:

```txt id="cicd03"
.github/workflows/ci.yml
```

ONLY after approval.

---

# What Repolyx MCP SHOULD NOT DO

To keep MVP safe:

* no autonomous coding
* no automatic code rewriting
* no silent deployments
* no unrestricted terminal execution
* no pushing without approval

AI should:

* guide
* validate
* explain
* recommend

NOT:

* take over development

---

# UI/UX Design

---

# Main Dashboard

```txt id="layout01"
------------------------------------------------

Connected Workspace

/project/repolyx

Status:
Connected

Framework:
Next.js

Git:
Initialized

Branch:
main

GitHub:
Connected

------------------------------------------------

Repository Health

✓ README exists
✓ .gitignore exists
⚠ TypeScript errors found
⚠ Missing environment docs

------------------------------------------------

GitHub Assistant

[ Push To GitHub ]
[ Create Repository ]
[ Create Branch ]
[ Enable CI/CD ]
[ Review Before Push ]

------------------------------------------------

AI Suggestions

- Add .env.example
- Fix auth.ts type issue
- Create API documentation
- Configure GitHub Actions

------------------------------------------------
```

---

# Beginner-Friendly Chat

User:

```txt id="chat01"
What is a branch?
```

AI:

```txt id="chat02"
A branch is a separate version of your project where you can safely test changes without affecting the main code.
```

---

# Repository Health System

Repolyx shows:

* Build Status
* Git Status
* Documentation Health
* Dependency Health
* Security Warnings
* GitHub Readiness

---

# Recommended MCP Modules

---

# Filesystem MCP

* scan folders
* read files
* detect framework

---

# Git MCP

* git status
* branch creation
* commit history

---

# GitHub MCP

* create repositories
* push code
* create PR
* GitHub workflow integration

---

# Validation MCP

* TypeScript checks
* ESLint
* build validation
* dependency validation

---

# Documentation MCP

* README generation
* API docs
* architecture docs

---

# How Push Actually Works

VERY IMPORTANT.

Repolyx NEVER pushes directly without approval.

Correct flow:

```txt id="push01"
AI prepared repository for push.

Changes:
- initialized Git
- generated README
- added .gitignore
- created GitHub Actions workflow

Push to GitHub?
```

Buttons:

```txt id="push02"
[ Push Now ]
[ Cancel ]
```

---

# Final Product Identity

Repolyx is NOT:

```txt id="identity01"
AI coding bot
```

Repolyx IS:

```txt id="identity02"
AI Repository Intelligence & GitHub Workflow Assistant
```

That is:

* unique
* useful
* realistic
* beginner-friendly
* industry-grade

---

# Final MVP Goal

Help users:

* connect local repositories
* validate projects
* understand GitHub workflows
* prepare repositories professionally
* detect issues before push
* improve repository quality

through:

* AI guidance
* repository intelligence
* beginner-friendly explanations
* approval-based workflows

without overwhelming users or taking control away from them.
