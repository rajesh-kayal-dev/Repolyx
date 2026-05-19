# Repolyx Repository Workspace — MVP Plan

## Overview

The Repository Workspace is the core feature of Repolyx.
It allows users to connect GitHub repositories, analyze source code, understand architecture, query repositories using AI, and generate developer documentation from a single workspace.

The MVP focuses on:

* repository import
* repository indexing
* AI-powered repository understanding
* developer productivity workflows

The goal is to build a real engineering product with practical workflows instead of fake AI dashboard effects.

---

# Core User Flow

```txt
GitHub Login
→ Import Repository
→ Clone Repository
→ Index Files
→ Generate AI Summary
→ Open Workspace
→ Ask Questions / Analyze Code / Generate Docs
```

---

# Repository Workspace Layout

## Top Navigation

Purpose:
Global workspace controls and repository switching.

### Features

* repository selector
* branch selector
* indexing status
* search bar
* quick actions:

  * Run Analysis
  * Ask AI
  * Generate Docs

---

# Left Sidebar — File Explorer

Purpose:
Browse repository structure.

### Features

* searchable file tree
* collapsible folders
* file indexing state
* AI-highlighted important files
* file metadata

### Backend Integration

Uses:

* repository scanner
* file indexing engine

---

# AI Repository Summary

Purpose:
Show AI-generated repository understanding.

### Features

* repository overview
* architecture explanation
* framework detection
* dependency overview
* auth flow detection

### Backend Integration

Generated from:

* file scanner
* package analysis
* AI summarization service

---

# Suggested Actions

Purpose:
Help users quickly interact with repository intelligence.

### Example Actions

* Analyze layout structure
* Review dependencies
* Detect auth flow
* Generate architecture docs
* Review performance risks

### Backend Integration

Generated dynamically from:

* repository metadata
* AI analysis results

---

# Query Codebase

Purpose:
Natural language interaction with repository.

### Features

* ask questions about codebase
* architecture explanation
* dependency understanding
* auth flow tracing
* file references

### Example Queries

```txt
Where is authentication handled?
Explain backend flow
Show API relationships
Which file manages sessions?
```

### Backend Integration

Flow:

```txt
User Query
→ Context Retrieval
→ Relevant Files
→ AI Processing
→ Response
```

---

# Recent Activity

Purpose:
Track repository events and AI operations.

### Example Events

* repository indexed
* dependencies updated
* auth flow detected
* docs generated
* analysis completed

### Backend Integration

Uses:

* activity service
* indexing logs
* AI task history

---

# Details Panel

Purpose:
Quick repository metadata.

### Features

* tech stack
* dependency count
* auth flows
* visibility
* indexing state
* last sync time

### Backend Integration

Generated during repository indexing.

---

# Backend MVP Modules

# 1. Authentication Module

### Responsibilities

* GitHub OAuth login
* session management
* user storage

### Status

Completed.

---

# 2. Repository Import Module

### Responsibilities

* fetch GitHub repositories
* import repositories
* save repository metadata

### API

```txt
POST /api/repositories/import
```

---

# 3. Repository Cloning Module

### Responsibilities

* clone repositories locally
* manage local repository storage

### Storage Path

```txt
/server/storage/repos
```

### Recommended Package

```txt
simple-git
```

---

# 4. Repository Scanner

### Responsibilities

* scan folders
* detect files
* generate file tree
* collect metadata

### Scanned Data

* folder structure
* extensions
* line counts
* file paths

---

# 5. Repository Indexer

### Responsibilities

* generate repository intelligence
* detect frameworks
* detect dependencies
* prepare AI context

### Output

* architecture summary
* dependency mapping
* repository metadata

---

# 6. AI Summary Engine

### Responsibilities

Generate:

* repository overview
* architecture explanation
* auth flow summary
* dependency insights

### AI Provider

OpenAI API.

---

# 7. AI Query Engine

### Responsibilities

* answer repository questions
* retrieve relevant files
* provide contextual AI responses

---

# 8. Activity System

### Responsibilities

Track:

* indexing events
* AI operations
* repository updates
* analysis history

---

# Database Models

## User

```txt
id
githubId
username
email
avatarUrl
createdAt
```

---

## Repository

```txt
id
userId
githubRepoId
name
fullName
visibility
defaultBranch
language
description
cloneUrl
isIndexed
createdAt
updatedAt
```

---

## RepositoryFile

```txt
id
repositoryId
path
name
extension
size
contentHash
createdAt
```

---

## Activity

```txt
id
repositoryId
type
message
createdAt
```

---

# MVP Engineering Rules

## Keep UI Practical

Focus on:

* clarity
* productivity
* workflow speed
* readability

Avoid:

* fake AI dashboards
* excessive animations
* decorative widgets
* unnecessary complexity

---

# Keep Backend Modular

Recommended structure:

```txt
src/
  modules/
  services/
  controllers/
  routes/
  middleware/
  utils/
```

---

# Use Real Data

Every UI section should eventually display:

* real repository files
* real indexing results
* real AI outputs

Avoid placeholder systems.

---

# Prioritize Functionality

Build order:

```txt
Authentication
→ Repository Import
→ Repository Cloning
→ File Scanning
→ Repository Indexing
→ AI Summary
→ AI Query
→ Documentation
```

---

# Final MVP Goal

The Repository Workspace should feel like:

```txt
GitHub + Vercel + AI Repository Intelligence
```

The product should help developers:

* understand repositories faster
* analyze architecture
* query codebases using AI
* generate technical documentation
* improve developer workflows

without overwhelming the user with unnecessary complexity or fake futuristic UI.
