# AGENT.md

# Joblio

> A modern, self-hosted Applicant Tracking System (ATS) built with Astro, React and PostgreSQL.

This document defines the architecture, coding conventions and development guidelines for every contributor (human or AI).

---

# Vision

Joblio is **not** a simple CRUD application.

The goal is to build an open-source ATS that feels as polished as products like:

- Linear
- GitHub
- Vercel Dashboard
- Notion

while remaining:

- self-hosted
- privacy-first
- fast
- accessible
- developer-friendly

---

# Core Principles

## 1. Simplicity

Keep APIs small.

Avoid unnecessary abstractions.

Prefer explicit code over magic.

---

## 2. Type Safety

Everything should be typed.

- TypeScript strict mode
- Drizzle ORM
- Zod validation

Avoid `any`.

---

## 3. Server First

Whenever possible:

- fetch on the server
- render on the server

Hydrate React only when interaction is required.

---

## 4. Feature Driven

Never organize code by file type.

Prefer:

```text
features/
    applications/
    companies/
    dashboard/
```

instead of

```text
components/
hooks/
pages/
services/
```

Business logic belongs inside each feature.

---

# Tech Stack

- Astro
- React
- TypeScript
- PostgreSQL
- Drizzle ORM
- TailwindCSS v4
- shadcn/ui
- TanStack Table
- TanStack Query
- Lucide Icons
- Zod
- Biome

---

# Project Structure

```text
src/

    components/
        ui/

    features/

        applications/

        companies/

        contacts/

        interviews/

        dashboard/

        settings/

    db/

        schema/

        relations.ts

        client.ts

    layouts/

    lib/

    pages/

    styles/

    types/
```

---

# Database

Use PostgreSQL.

Never duplicate data.

Prefer normalization.

Relations must use foreign keys.

Use UUID primary keys.

Never use auto-increment IDs.

---

# Naming

Database

```text
created_at
updated_at
follow_up_date
company_id
```

TypeScript

```ts
createdAt;

updatedAt;

followUpDate;

companyId;
```

Use camelCase in code.

Use snake_case in SQL.

---

# Components

Components should remain small.

Good:

```text
ApplicationCard

ApplicationTable

StatusBadge

CompanyAvatar

InterviewTimeline
```

Avoid components larger than ~250 lines. Extract reusable pieces when they grow too much.

---

# Pages

Pages should only:

- fetch data
- compose UI

Avoid business logic.

---

# Business Logic

Business logic belongs inside

```text
features/
```

Example

```text
features/

    applications/

        actions.ts

        queries.ts

        schema.ts

        types.ts

        components/
```

---

# Validation

Never trust user input.

Always validate with Zod.

Example:

```ts
const schema = z.object({
  title: z.string().min(1),
});
```

---

# Database Rules

Use enums whenever possible.

Always define indexes.

Always define foreign keys.

Never use text when an enum exists.

Never duplicate company names.

Never store files inside PostgreSQL.

Store only metadata.

---

# Activities

Every important action should create an activity.

Examples:

- application created
- status updated
- interview added
- document uploaded
- follow-up completed

The dashboard timeline should come from this table.

---

# Styling

Use TailwindCSS.

Prefer utility classes.

Avoid inline styles.

Use CSS variables for theming.

---

# Colors

Primary

Blue

Success

Green

Warning

Amber

Danger

Red

Neutral

Slate

---

# Icons

Always use Lucide Icons.

Never mix icon libraries.

---

# Forms

Use:

- React Hook Form (future)
- Zod

Every form should have:

- loading state
- validation
- success state
- error state

---

# Tables

Use TanStack Table.

Support:

- sorting
- filtering
- pagination
- column visibility

---

# Accessibility

Every interactive element must have:

- keyboard support
- focus state
- aria labels when needed

Accessibility is not optional.

---

# Performance

Prefer SSR.

Avoid unnecessary hydration.

Avoid unnecessary client-side state.

Memoize only when profiling shows a benefit.

---

# Code Style

Use Biome.

Run:

```bash
npm run format
```

before committing.

---

# Git

Branch naming

```text
feature/dashboard

feature/interviews

fix/table

refactor/database
```

Commit examples

```text
feat(applications): add CRUD

feat(companies): add company details

fix(database): add missing index

refactor(layout): simplify sidebar
```

Follow Conventional Commits.

---

# Future Roadmap

- Authentication
- Calendar
- Email integration
- Browser extension
- AI suggestions
- Analytics
- Kanban
- Notifications
- Resume parsing
- Import from LinkedIn
- Mobile support

---

# Philosophy

Write code that is:

- readable
- maintainable
- scalable
- boring

Boring code is good code.

Optimize for the next developer.

Assume every file will still exist in five years.

When in doubt:

Choose clarity over cleverness.
