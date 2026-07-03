# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Team Kanban Board** — A real-time collaborative kanban board for small teams (3–10 people).

**Tech Stack:**
- Frontend: Next.js 14 (App Router) + React + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Drag & Drop: @dnd-kit
- Database & Realtime: Supabase (PostgreSQL + Realtime subscriptions)
- Deployment: Vercel

**Scope:** MVP (2–3 hours)
- Single board view
- Card & column CRUD
- Drag & drop within and across columns
- Real-time synchronization via Supabase Realtime
- Mobile-responsive design

See `docs/` for full requirements, personas, scenarios, design, and architecture.

---

## Development Workflow

### Initial Setup (Milestone M1)

```bash
# Create Next.js project with TypeScript & Tailwind
npx create-next-app@latest kanban --typescript --tailwind --app

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add required shadcn/ui components
npx shadcn-ui@latest add button input dialog card badge

# Install dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @supabase/supabase-js
```

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production build locally
npm start

# Type checking
npx tsc --noEmit

# Lint (if configured)
npm run lint
```

### Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See `.env.example` (create during M6).

---

## Architecture & Key Files

### Core Structure

```
app/
  ├── layout.tsx              # Root layout, header, global styles
  └── page.tsx                # Main kanban board page

components/
  ├── board/
  │   ├── Board.tsx           # Kanban container with DndContext
  │   ├── Column.tsx          # Column component (droppable)
  │   ├── Card.tsx            # Card component (draggable)
  │   ├── CardModal.tsx       # Card detail/edit modal
  │   └── CardEditForm.tsx    # Card form (create/update)
  ├── common/
  │   ├── Header.tsx
  │   ├── Sidebar.tsx
  │   └── Dashboard.tsx
  └── ui/                     # shadcn/ui components

lib/
  ├── supabase.ts             # Supabase client init
  ├── hooks/
  │   ├── useBoard.ts         # Board data + Realtime subscription
  │   ├── useCards.ts         # Card CRUD operations
  │   ├── useColumns.ts       # Column CRUD operations
  │   └── useDragDrop.ts      # @dnd-kit integration
  ├── utils/
  │   ├── priority.ts         # Priority color/icon mapping
  │   └── constants.ts        # BOARD_ID, colors, etc.
  └── types.ts                # TypeScript types
```

### Key Hooks

**`useBoard(boardId)`** — Loads columns & cards from Supabase, subscribes to Realtime changes
- Returns: `{ columns, cards, loading, setColumns, setCards }`
- Handles INSERT/UPDATE/DELETE for both tables

**`useCards`** — Card CRUD operations
- `handleCreateCard(columnId, title, description, priority, dueDate)`
- `handleUpdateCard(cardId, updates)`
- `handleDeleteCard(cardId)`

**`useColumns`** — Column CRUD & reordering
- `handleAddColumn(name)`
- `handleDeleteColumn(columnId)`
- `handleReorderColumns(columnIds)`

**`useDragDrop`** — @dnd-kit drag-end handler
- Updates card `column_id` and `position` on Supabase

### Data Model

**Columns Table:**
```
id (UUID), board_id (UUID), name (TEXT), position (INTEGER), created_at (TIMESTAMP)
```

**Cards Table:**
```
id (UUID), column_id (UUID FK), title (TEXT), description (TEXT),
priority (ENUM: high/medium/low), due_date (DATE), position (INTEGER),
created_at (TIMESTAMP), updated_at (TIMESTAMP)
```

Both tables have Realtime enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE columns, cards;`

---

## Implementation Milestones

Follow `docs/07-plan.md` for detailed milestone breakdown. Quick summary:

| M | Task | Time | Status |
|---|------|------|--------|
| M1 | Project init + Supabase setup | 20m | Start here |
| M2 | Layout + column display | 25m | After M1 |
| M3 | Card & column CRUD | 40m | Core features |
| M4 | Drag & drop (@dnd-kit) | 35m | Interaction |
| M5 | Supabase Realtime sync | 25m | Collab |
| M6 | Mobile responsive + polish | 20m | Deploy-ready |

**Total: ~165 minutes (2h 45m)**

---

## Design & Interaction Patterns

### State Flow

1. User action (UI)
2. Local state update (optimistic)
3. Render immediately
4. Supabase async write
5. Realtime broadcasts to other clients
6. Subscribers merge changes

### Realtime Conflict Resolution

On INSERT/UPDATE/DELETE events, merge with local state:
- INSERT: append new rows
- UPDATE: replace by ID
- DELETE: filter by ID
- No timestamps needed (MVP assumption: no concurrent edits)

### Responsiveness

- Desktop (1200px+): Full board view, 4+ columns
- Tablet (768–1199px): 2–3 columns, scroll
- Mobile (<768px): 1 column, horizontal scroll or tabs

---

## Common Tasks

### Add a New Card Field

1. Update Supabase schema (add column to `cards` table)
2. Update `lib/types.ts` (Card type)
3. Update `CardEditForm.tsx` (add input)
4. Update `Card.tsx` (display)
5. Update `useCards.ts` hook (pass in CRUD ops)

### Change Priority Colors

Edit `lib/utils/priority.ts` and references in styling (Tailwind classes).

### Test Realtime Sync

Open the app in two browser tabs/windows, perform actions on one tab, verify updates appear instantly on the other.

### Deploy to Vercel

```bash
git push origin main
```

Vercel auto-deploys. Set environment variables in Vercel dashboard matching `.env.local`.

---

## Important Notes

- **No authentication (MVP):** All data is public. Add RLS policies in v2.
- **Single board:** Hard-coded `board_id`. Multi-board support is v2.
- **Supabase Realtime publishes all changes to all clients.** Filtering by `board_id` happens client-side in the subscription handler.
- **Optimistic updates:** UI responds instantly; Supabase write happens async. Rollback on error.
- **Drag & drop:** @dnd-kit provides sensors for mouse, touch, and keyboard. Position reordering uses a simple numeric position field.

---

## Troubleshooting

**"Failed to connect to Supabase"**
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project exists and tables are created

**Realtime not updating**
- Confirm tables have Realtime enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE columns, cards;`
- Check browser console for subscription errors
- Verify `useBoard` hook is mounted and `boardId` is correct

**Drag & drop not working on mobile**
- Ensure `@dnd-kit/core` TouchSensor is active in `useDragDrop` or `Board.tsx`
- Test in mobile browser dev tools

---

## References

- **Requirements:** `docs/01-requirements.md`
- **Personas & Scenarios:** `docs/02-personas.md`, `docs/03-scenarios.md`
- **Design:** `docs/05-design.md`
- **Architecture:** `docs/06-architecture.md`
- **Implementation Plan:** `docs/07-plan.md` ← Start here for step-by-step tasks
- **Mockups:** `docs/mockups/` (HTML prototypes)

---

## Next Steps

1. Follow `docs/07-plan.md` **M1** to initialize the Next.js project
2. After M1, confirm `npm run dev` starts successfully
3. Continue with M2–M6 in sequence
4. Test on desktop, tablet, and mobile before deploying
5. Deploy to Vercel when all milestones complete
