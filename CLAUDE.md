# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

智能待办清单应用 - A cross-platform smart todo app built with Tauri 2.0 (desktop + Android), featuring AI-powered natural language task parsing.

**Status**: Design phase - see `smart-todo-design.md` for full specifications.

## Tech Stack

### Client
- **Framework**: Tauri 2.0 (Rust backend + web frontend)
- **UI**: React 18 + TypeScript
- **State**: Zustand (client) + React Query (server state)
- **Styling**: Tailwind CSS
- **Offline Storage**: Dexie.js (IndexedDB)

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT

## Build Commands

```bash
# Frontend (when implemented)
npm install
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint

# Tauri
npm run tauri dev    # Run Tauri in dev mode
npm run tauri build  # Build desktop app

# Backend (when implemented)
cd backend
npm install
npm run start:dev    # Development
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # E2E tests
```

## Architecture

```
Client (Tauri)                    Backend (NestJS)
├── React UI                      ├── auth/      - JWT authentication
├── Zustand stores                ├── task/      - Task CRUD, recurrence
├── React Query hooks             ├── ai/        - NLP parsing, suggestions
├── Dexie.js offline DB           ├── analytics/ - Stats aggregation
└── Sync manager                  └── sync/      - Multi-device sync
```

### Key Data Flow
1. **Task Creation**: User input → AI parse (`/tasks/parse`) → Preview → Confirm → Create
2. **Offline Sync**: Local changes → IndexedDB queue → Network restore → Batch sync → Conflict resolution

### Core Entities
- `Task`: Main entity with AI metadata (confidence, suggestions, rawInput)
- `UserAnalytics`: Completion rates, time patterns, task insights

## Code Conventions

- Components: PascalCase (`TaskCard.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- TypeScript strict mode enabled
- Functional components with hooks only
