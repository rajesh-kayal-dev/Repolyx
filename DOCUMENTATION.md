# Repolyx Project Documentation

## 1. Project Overview

**Repolyx** is an AI-Native Engineering Workspace & Developer Intelligence Platform. It serves as an industry-standard modern monorepo designed to facilitate repository analysis, track workflow metrics, provide AI-driven code insights, and maintain security logs. The platform empowers developers by bringing intelligence to their workflows through automated scanning, AI-powered chat, and deep codebase insights.

---

## 2. Core Goals & Objectives

- **Intelligent Repository Analysis:** Automatically parse, index, and analyze repositories to map their structure, file counts, and dependency distributions.
- **Developer Intelligence:** Provide AI-powered assistance for code insights, debugging, and generating technical documentation.
- **Workflow & Health Monitoring:** Track CI/CD pipelines, pull request cycles, deployment frequencies, and assess the overall health of the codebase.
- **Security & Compliance:** Maintain audit trails, scan for vulnerabilities, and provide comprehensive compliance reports.
- **Gamification & Engagement:** Visualize GitHub activity, track contribution streaks, and highlight engineering milestones via achievements and badges.

---

## 3. Current Feature Set

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat & Debug Assistant** | Intelligent repository-aware assistant for code insights and debugging. |
| 📊 **Workflow Metrics** | Track CI/CD pipelines, PR cycles, and deployment frequency. |
| 🔍 **Repo Analysis & Scanning** | Deep codebase insights, dependency graphs, and health checks. |
| 🛡️ **Security Logs** | Audit trails, vulnerability scanning, and compliance reports. |
| 🔐 **GitHub Auth** | Seamless OAuth integration using Passport.js. |
| 📄 **AI Documentation Workspace** | Automated generation of READMEs, API Documentation, Setup Guides, Architecture Summaries, and more. |
| 📈 **Contribution & Activity Tracking** | Visual heatmaps, contribution graphs, and real-time activity feeds. |
| 🎨 **Modern UI** | Dark-themed, highly interactive interface built with Framer Motion and Tailwind CSS. |

---

## 4. Architecture & Technology Stack

Repolyx is structured as a modern full-stack monorepo, divided into two primary workspaces:

### Frontend (`/client`)
A high-performance, responsive user interface.
- **Framework:** Next.js 14 (App Router), React 18
- **Language:** TypeScript
- **Styling & Animation:** Tailwind CSS, Framer Motion

### Backend (`/server`)
A scalable, modular API server.
- **Runtime:** Node.js (v20+ recommended)
- **Framework:** Express 5 (ESM JavaScript)
- **Database ORM:** Prisma
- **Database:** Serverless Neon PostgreSQL
- **Validation & Auth:** Zod, Passport.js (GitHub OAuth), JWT

### System Flow
1. **Client** communicates with the **Server** via HTTP/WebSocket APIs.
2. **Server** validates requests using Zod, processes business logic through controllers and middleware.
3. **Prisma** acts as the data access layer, interacting with the **Neon PostgreSQL Database**.
4. Both client and server employ environment variable validation at startup to ensure safe execution.

---

## 5. Domain Concepts & Database Schema

### Core Domain Vocabulary
- **Workspace:** An isolated environment representing a configured Git repository.
- **Scan/Indexing:** The automated process of parsing a repository and storing its metadata.
- **Contribution Graph:** Visual representation of a user's GitHub activity.
- **Repository Health:** A rating indicator based on codebase metrics and warning flags (e.g., outdated dependencies).
- **Activity Feed:** A stream capturing key events within the workspace.

### Database Tables (Prisma)
- **User:** GitHub OAuth profile details and session associations.
- **Session (PrismaSessionStore):** Persisted session store for Express.
- **Repository:** Metadata for scanned codebases (name, language, health score, etc.).
- **Activity:** Logs representing events on the overview feed.
- **Scan:** Detailed logs of workspace index runs.

---

## 6. Future Implementation & Roadmap

- **Advanced AI Agents:** Implementing autonomous AI agents that can automatically suggest and apply pull request fixes based on repository health checks.
- **Extended Integrations:** Support for Git providers beyond GitHub, such as GitLab and Bitbucket.
- **Customizable Dashboard Widgets:** Allowing users to tailor their dashboard with specific workflow metrics and security alerts.
- **Real-time Collaboration:** Introducing multiplayer features for pair programming and collaborative code reviews within the workspace.
- **Enhanced Documentation Generation:** Improving the AI Documentation Workspace to support diagram generation (e.g., Mermaid.js) directly from codebase analysis.
