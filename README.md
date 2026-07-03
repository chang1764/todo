# Team Kanban Board 🎯

A **real-time collaborative kanban board** for small teams (3–10 people), built with Next.js, TypeScript, Supabase, and @dnd-kit.

## ✨ Features

- **Real-time Collaboration** — Changes sync instantly across all clients via Supabase Realtime
- **Card Management** — Create, edit, delete cards with title, description, priority, due date
- **Column Management** — Add, delete, reorder columns
- **Drag & Drop** — Drag cards across columns, reorder within columns (@dnd-kit)
- **Mobile Responsive** — Works on desktop, tablet, and mobile
- **Live Status** — See connection status and other users' activity
- **Optimistic Updates** — UI responds instantly; Supabase syncs in background

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `SQL Editor`:

```sql
-- columns table
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL DEFAULT '550e8400-e29b-41d4-a716-446655440000',
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  due_date DATE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE columns, cards;

-- Disable RLS (for MVP)
ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
```

3. Copy your Supabase URL and Anon Key

### 2. Setup Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Development

### Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Run ESLint
```

### Project Structure

```
app/              # Next.js App Router
├── layout.tsx    # Root layout + header
└── page.tsx      # Main kanban board

components/
├── board/        # Kanban board components
│   ├── Board.tsx       # Main container with DndContext
│   ├── Column.tsx      # Droppable column
│   ├── Card.tsx        # Draggable card
│   ├── CardModal.tsx   # Edit modal
│   └── CardEditForm.tsx
├── common/       # Header
└── ui/           # Reusable UI (Button, etc.)

lib/
├── hooks/        # Custom hooks
│   ├── useBoard.ts           # Load data + Realtime subscribe
│   ├── useCards.ts           # Card CRUD
│   ├── useColumns.ts         # Column CRUD
│   ├── useDragDrop.ts        # @dnd-kit handler
│   └── useRealtimeStatus.ts  # Connection status
├── supabase.ts   # Supabase client
├── types.ts      # TypeScript types
└── utils/        # Utilities (colors, constants)

docs/             # Product documentation
├── 01-requirements.md
├── 02-personas.md
├── 03-scenarios.md
├── 05-design.md
├── 06-architecture.md
└── 07-plan.md
```

### Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | **Next.js 14** (App Router) | Server components, build optimization |
| UI | **shadcn/ui** + **Tailwind CSS** | Accessible, responsive components |
| State | **React Hooks** | Realtime syncs; simple local state |
| Drag & Drop | **@dnd-kit** | Lightweight, headless, mobile-friendly |
| Backend | **Supabase PostgreSQL** | Managed, RLS-ready |
| Realtime | **Supabase Realtime** | Built-in Postgres subscriptions |
| Deployment | **Vercel** | Next.js native, auto-scaling |

## 🔄 How It Works

1. **User Action** (e.g., add card) → UI updates instantly (optimistic)
2. **Supabase Insert** happens in background
3. **Realtime Event** broadcasts to all subscribed clients
4. **Other Clients** see the change automatically
5. **On Error** — local state rolls back

## 📱 Responsive Design

- **Desktop** (1200px+): All columns visible, full board
- **Tablet** (768–1199px): 2–3 columns, horizontal scroll
- **Mobile** (<768px): 1 column visible, horizontal scroll

## 🚢 Deployment

### Deploy to Vercel

```bash
git push origin main
```

Vercel auto-deploys. Set environment variables in Vercel dashboard.

### Production Checklist

- [ ] Supabase RLS policies enabled (if auth added)
- [ ] Environment variables configured in Vercel
- [ ] .env.local excluded from git
- [ ] Build succeeds locally (`npm run build`)
- [ ] All CRUD operations tested in production

## 🗺️ Roadmap (v2+)

- [ ] User authentication (Clerk or Auth0)
- [ ] Multiple boards per user
- [ ] Board sharing & permissions
- [ ] Comments & activity feed
- [ ] File attachments
- [ ] Labels & filtering
- [ ] Dark mode
- [ ] Export to CSV

## 🤝 Contributing

This is a MVP built in ~2.5 hours. Contributions welcome!

## 📄 License

MIT

## 📚 Docs

- **Product Specs**: See `docs/01-requirements.md`
- **Architecture**: See `docs/06-architecture.md`
- **Implementation Plan**: See `docs/07-plan.md`
- **Claude Guide**: See `CLAUDE.md`

---

**Built with ❤️ for teams that ship fast**
