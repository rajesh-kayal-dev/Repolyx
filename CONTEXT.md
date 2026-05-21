# Domain Context: Repolyx

This document defines the core domain concepts, vocabulary, and abstractions used across the Repolyx repository. All agents and developers must align with this vocabulary.

## Core Domain Concepts

### 1. Workspace
An isolated environment loaded into Repolyx for code analysis, scanning, and chat. Currently, a workspace represents a configured git repository.

### 2. Scan / Indexing
The automated process of parsing a repository, mapping its structure, file counts, and dependency distributions.
- **Indexed Repository:** A repository that has successfully completed scanning and is stored in the database.
- **Scan History:** The logs and metadata detailing past scan events.

### 3. Contribution Graph
A heatmap and statistics widget visualizing a user's GitHub activity over time, including total contributions, streaks, active days, and language distribution.

### 4. Achievement / Badge
Gamification elements scraped or read from a user's GitHub profile (e.g., Pull Shark, Quickdraw, Starry Night) representing engineering milestones.

### 5. Repository Health
A rating indicator representing codebase metrics, warning flags (such as outdated dependencies, missing READMEs), and general maintenance health.

### 6. Activity Feed
A human-readable log stream capturing key events within the workspace (e.g., repository scan completed, README summary generated, session started).

## Database Schema & Abstractions

Repolyx uses Prisma connected to a serverless PostgreSQL database. The core tables are:
- **User:** Standard user credentials, GitHub OAuth profile details, and session associations.
- **Session / PrismaSessionStore:** Persisted session store for Express authentication.
- **Repository:** Metadata for scanned codebase (name, language, status, health score, default branch, etc.).
- **Activity:** Simple logs representing events on the overview feed.
- **Scan:** Logs detailing workspace index runs.
