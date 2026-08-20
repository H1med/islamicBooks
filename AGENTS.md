# AGENTS.md

## PROJECT CONTEXT & FRAMEWORK RULES

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend & Database:** Supabase (Auth, Postgres Database, Storage).
- **Icon Library:** `lucide-react` (Strictly NO emojis in the UI).
- **Design System:** Follow strictly `@DESIGN.md`.

# CRITICAL RULES - MUST FOLLOW

## RESPONSES
- Keep responses concise and to the point.

## PLANNING MODE
- Always ask clarifying questions before writing complex code.
- Use deep-dive sub-agents to assist with research and schema verification.

## MEMORY & SESSION CONTEXT
- **At the start of every session or new task:** Always read through the existing markdown files in the `/memory` directory to understand previous progress, context, and decisions.
- **After completing a feature or task:** You MUST create a summary markdown file inside the `/memory` directory documenting your work.
  - **Features Implemented:** What was built or modified.
  - **Errors Encountered:** What issues occurred during build or migration.
  - **Resolutions:** How those errors were solved.

## GIT / VERSION CONTROL
- **Main/Master Protection:** NEVER start making code changes if the current branch is `main` or `master`.
- **Feature Branches:** Always create a dedicated feature branch first (e.g., `feature/catalog-view`, `feature/supabase-schema`).

## SUPABASE & DATA HANDLING
- All database modifications MUST be handled via Supabase MCP or explicit SQL migration files.
- Enable RLS on **EVERY** table.
