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

---

## 7. Feature: AI GitHub Workspace (Powered by MCP)

**Overview**
I want to add a new feature to Repolyx called AI GitHub Workspace.
This feature should provide a beginner-friendly interface that allows users to connect their GitHub account using a Personal Access Token (PAT) and then manage repositories using natural language through an AI chat interface.
The goal is to hide all Git commands and GitHub API complexity from the user.
The experience should feel like talking to an AI software engineer.

### Feature Flow
**Sidebar**
`AI GitHub Workspace` -> `Connect GitHub` -> `Paste GitHub Personal Access Token` -> `Validate Token` -> `Connected Successfully` -> `AI Chat Environment` -> `User manages GitHub repositories using natural language`

### UI
Create a new page: `/workspace/github`
The page should contain two states.

#### State 1: Not Connected
Show a clean card:
> **GitHub AI Workspace**
> Connect your GitHub account to allow AI to manage your repositories.
> -------------------------------------
> **GitHub Personal Access Token**
> `[____________________________]`
> **[Connect]**

Below the input show: "How to generate a GitHub Personal Access Token" with a documentation link.
When user clicks Connect: Send token to backend.
Backend should: Verify token with GitHub API, Fetch user profile, Return (username, avatar, name, email).
If valid: Store token securely, Show "Connected Successfully".
If invalid: Show "Invalid GitHub Token", Do not save invalid tokens.

#### State 2: Connected
Show: Avatar, Username, "Connected" badge, "Disconnect" Button.
Below that: "AI GitHub Workspace" title, then open a ChatGPT-style chat.

**Chat UI**
Modern AI chat including: message history, markdown rendering, code blocks, loading animation, streaming responses, auto scroll, copy button.
Input: "Ask AI to manage your repositories..." -> [Send]

### AI Capabilities
The AI should understand natural language.

**Examples:**
- **Repository Management:** Create a repository named ecommerce-api, Create a private repository, Rename repository, Delete repository, Archive repository, Fork repository
- **Git Operations:** Create a branch named feature/auth, Merge branch, Delete branch, Commit current changes, Push changes, Clone repository, Create release
- **Documentation:** Generate README, Improve README, Generate CONTRIBUTING.md, Create LICENSE, Generate API documentation, Create CHANGELOG
- **Project Setup:** Create Node.js project, Create Express project, Create Next.js project, Create NestJS project, Create React project, Create TypeScript configuration, Initialize Git
- **Project Improvement:** Review project, Find bugs, Fix bugs, Improve folder structure, Refactor code, Remove duplicate code, Find security issues, Optimize performance, Generate unit tests
- **GitHub Features:** Create Pull Request, Review Pull Request, Merge Pull Request, Create Issue, Assign labels, Close issue, Generate Release Notes
- **Project Automation:** Setup GitHub Actions, Create CI/CD pipeline, Add Docker support, Create docker-compose, Setup ESLint, Setup Prettier, Setup Husky, Setup Commitlint
- **Repository Analysis:** Explain project structure, Find unused files, Show dependency graph, Explain authentication flow, Analyze architecture, Find large files, Generate project summary

### Backend
Create: `github.service.ts`, `github.controller.ts`, `github.routes.ts`, `github.tools.ts`, `github.mcp.ts`
Use GitHub REST API. All GitHub operations should go through one service layer.

**MCP Layer**
Create an internal MCP-style tool layer. Each GitHub action should be implemented as a separate tool.
Examples: `CreateRepositoryTool`, `CreateBranchTool`, `CreateReadmeTool`, `PushChangesTool`, `CommitTool`, `ReviewRepositoryTool`, `FixBugTool`, `CreateWorkflowTool`, `GenerateDocsTool`.
The AI should choose the correct tool based on the user's prompt.

**AI Workflow**
`User Prompt` -> `AI understands intent` -> `Select GitHub Tool` -> `Execute Tool` -> `Return Result` -> `Explain what was done`

**Example:**
*User:* Create a repository named AI Notes
*AI:* -> `CreateRepositoryTool` -> `GitHub API` -> `Repository Created`
*Response:* Repository "AI Notes" has been created successfully. Repository URL: https://github.com/username/ai-notes

### Security
- Never expose the GitHub token.
- Encrypt it before storing.
- Allow users to disconnect. When disconnected: Delete the stored token.
- Never log tokens. Never send tokens to the frontend after the initial connection.

### Database
Create table `GithubConnection`: `id`, `userId`, `githubId`, `username`, `avatar`, `encryptedToken`, `connectedAt`, `updatedAt`
Relationship: `User` -> `GithubConnection` (One connection per user).

### Future Ready
Design the system so additional MCP providers can be added later (e.g., GitLab MCP, Bitbucket MCP, Docker MCP, Filesystem MCP, PostgreSQL MCP, Slack MCP, Jira MCP). The GitHub implementation should follow a provider-based architecture.
