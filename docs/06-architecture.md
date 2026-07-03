# 06 — 아키텍처

## 기술 스택 확정

| 계층 | 기술 | 선정 이유 |
|---|---|---|
| **프론트엔드** | Next.js 14 (App Router) | 풀스택, 서버 컴포넌트, 빌드 최적화 |
| **UI 컴포넌트** | shadcn/ui + Tailwind CSS | 접근성, 커스터마이징, 반응형 자동 |
| **드래그&드롭** | @dnd-kit | 경량, 헤드리스, 모바일 지원 |
| **상태관리** | React state (useState) | MVP 스코프, Realtime 동기화로 충분 |
| **실시간 동기화** | Supabase Realtime | 풀스택 솔루션, 클라우드 DB 통합 |
| **데이터베이스** | Supabase PostgreSQL | 관계형 데이터, Row-Level Security 가능 |
| **배포** | Vercel | Next.js 네이티브, 자동 스케일링 |

### 비채택 사항 및 이유
- ❌ **Redux/Zustand**: 로컬 상태만 필요, Realtime이 주 동기화 매커니즘 → 단순함 우선
- ❌ **GraphQL**: REST로 충분, MVP 단계에서 오버엔지니어링
- ❌ **Socket.io**: Supabase Realtime이 이미 제공
- ❌ **React Hook Form**: 간단한 입력 폼만 있으므로 기본 상태로 충분

---

## 폴더 구조

```
kanban-board/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (헤더, 전역 스타일)
│   ├── page.tsx                # 메인 칸반 보드 페이지
│   └── api/
│       └── (realtime 구독은 클라이언트에서 처리)
├── components/
│   ├── board/
│   │   ├── Board.tsx           # 메인 칸반 보드 컨테이너
│   │   ├── Column.tsx          # 개별 컬럼
│   │   ├── Card.tsx            # 개별 카드
│   │   ├── CardModal.tsx       # 카드 상세 모달
│   │   └── CardEditForm.tsx    # 카드 편집 폼
│   ├── ui/
│   │   ├── button.tsx          # shadcn/ui Button
│   │   ├── input.tsx           # shadcn/ui Input
│   │   ├── dialog.tsx          # shadcn/ui Dialog (모달)
│   │   ├── badge.tsx           # shadcn/ui Badge
│   │   ├── card.tsx            # shadcn/ui Card
│   │   └── [other shadcn...]   # 필요한 shadcn 컴포넌트
│   ├── common/
│   │   ├── Header.tsx          # 앱 헤더
│   │   ├── Sidebar.tsx         # 좌측 사이드바 (모바일 숨김)
│   │   └── Dashboard.tsx       # 우측 대시보드 위젯
│   └── icons/
│       └── PriorityIcon.tsx    # 우선도 표시 아이콘
├── lib/
│   ├── supabase.ts             # Supabase 클라이언트 초기화
│   ├── hooks/
│   │   ├── useBoard.ts         # 보드 데이터 및 Realtime 구독
│   │   ├── useCards.ts         # 카드 CRUD 및 동기화
│   │   ├── useColumns.ts       # 컬럼 CRUD 및 동기화
│   │   └── useDragDrop.ts      # @dnd-kit 통합
│   ├── utils/
│   │   ├── date.ts             # 날짜 포맷팅
│   │   ├── priority.ts         # 우선도 색상/아이콘 매핑
│   │   └── constants.ts        # 상수 (BOARD_ID, 색상 코드 등)
│   └── types.ts                # TypeScript 타입 정의
├── styles/
│   └── globals.css             # 전역 스타일 (Tailwind)
├── public/
│   └── [이미지, 아이콘]
├── .env.local                  # Supabase URL, Anon Key
├── package.json
└── tailwind.config.ts          # Tailwind 설정

```

---

## 타입 및 데이터 스키마

### TypeScript 타입 (`lib/types.ts`)

```typescript
// Supabase 테이블 스키마를 반영한 타입
export type Column = {
  id: string;           // UUID
  board_id: string;     // UUID (고정: 단일 보드)
  name: string;
  position: number;     // 컬럼 순서
  created_at: string;   // ISO 8601
};

export type Card = {
  id: string;           // UUID
  column_id: string;    // UUID (Foreign Key)
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;    // ISO 8601 date
  position: number;     // 컬럼 내 순서
  created_at: string;
  updated_at: string;
};

export type Board = {
  id: string;
  name: string;
  created_at: string;
};

// UI 상태용 타입
export type DragItem = {
  id: string;
  columnId: string;
  index: number;
};
```

### Supabase 테이블 (이미 생성됨)

```sql
-- columns 테이블
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL DEFAULT '550e8400-e29b-41d4-a716-446655440000',
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- cards 테이블
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

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE columns, cards;
```

---

## 상태 흐름 다이어그램

```
사용자 액션 (UI)
    ↓
React State 업데이트 (낙관적 업데이트)
    ↓
화면 렌더링 (즉시 반영)
    ↓
Supabase 저장 (비동기)
    ↓
Supabase Realtime 브로드캐스트 (다른 클라이언트에 전달)
    ↓
useBoard/useCards 구독자 감지
    ↓
React State 동기화 (충돌 해결)
    ↓
화면 업데이트 (다른 사용자 변경사항 반영)


구체 예시: 카드 생성
─────────────────────────────────────────

1. 사용자: "새 카드 추가" 버튼 클릭
   ↓
2. CardEditForm: title 입력 후 제출
   ↓
3. handleCreateCard() 호출
   ├─ 로컬 카드 객체 생성 (임시 ID)
   ├─ setCards([...cards, newCard]) ← 낙관적 업데이트
   ├─ 화면 즉시 반영
   └─ Supabase에 INSERT 요청 (async)
   ↓
4. Supabase 응답
   ├─ 성공: 실제 ID로 카드 업데이트
   └─ 실패: 로컬 상태 롤백 + 에러 토스트
   ↓
5. Realtime 이벤트: 모든 클라이언트에 브로드캐스트
   ├─ 다른 사용자의 화면에도 카드 추가됨
   └─ useBoard 구독자가 자동 동기화
```

---

## 핵심 Hook 및 로직

### `lib/hooks/useBoard.ts` — 보드 데이터 + Realtime 구독

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Column, Card } from '@/lib/types';

export function useBoard(boardId: string) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      const [colRes, cardRes] = await Promise.all([
        supabase
          .from('columns')
          .select('*')
          .eq('board_id', boardId)
          .order('position'),
        supabase.from('cards').select('*').order('position'),
      ]);

      if (!colRes.error) setColumns(colRes.data);
      if (!cardRes.error) setCards(cardRes.data);
      setLoading(false);
    };

    fetchData();
  }, [boardId]);

  // Realtime 구독
  useEffect(() => {
    const subscription = supabase
      .channel('board-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          // INSERT, UPDATE, DELETE 처리
          if (payload.eventType === 'INSERT') {
            setColumns((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setColumns((prev) =>
              prev.map((col) => (col.id === payload.new.id ? payload.new : col))
            );
          } else if (payload.eventType === 'DELETE') {
            setColumns((prev) => prev.filter((col) => col.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        (payload) => {
          // 동일한 INSERT/UPDATE/DELETE 처리
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.new.id ? payload.new : card
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [boardId]);

  return { columns, cards, loading, setColumns, setCards };
}
```

### `lib/hooks/useDragDrop.ts` — @dnd-kit 통합

```typescript
import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { supabase } from '@/lib/supabase';

export function useDragDrop() {
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const [type, cardId] = active.id.toString().split('-');
    const targetColumnId = over.id.toString();

    // 카드를 새 컬럼으로 이동 (position 업데이트)
    await supabase
      .from('cards')
      .update({ column_id: targetColumnId, position: 0 })
      .eq('id', cardId);
  }, []);

  return { handleDragEnd };
}
```

---

## Supabase 클라이언트 초기화 (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 외부 서비스 연동 흐름

### Supabase Realtime 보안

1. **데이터 공개 (인증 제외 — MVP)**
   - Row-Level Security (RLS) 비활성화
   - 모든 클라이언트가 읽고 쓸 수 있음
   - 향후 v2에서 RLS 추가

2. **Realtime 구독 필터**
   ```typescript
   // board_id 필터로 다른 보드 변경사항 제외
   .on('postgres_changes', {
     event: '*',
     schema: 'public',
     table: 'columns',
     filter: `board_id=eq.${boardId}`,
   })
   ```

3. **데이터 유효성 검증**
   - 클라이언트: 기본 입력 검증 (제목 필수, 날짜 형식 등)
   - 서버: Supabase 컬럼 타입 (NOT NULL, CHECK 등)

---

## 배포 고려사항

### Vercel 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 성능 최적화
- **ISR (Incremental Static Regeneration)**: 사용 안함 (동적 콘텐츠)
- **Edge 함수**: MVP 스코프 밖
- **이미지 최적화**: Next.js Image 컴포넌트 (아이콘만)

---

## 마이그레이션 스크립트 (향후 v2)

```typescript
// Realtime OFF → RLS ON 순서
// 1. RLS 정책 작성 (인증 사용자 전용)
// 2. Realtime 다시 활성화
// 3. 클라이언트: Supabase Auth 통합
```

