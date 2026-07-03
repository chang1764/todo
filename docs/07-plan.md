# 07 — 구현 계획 (마일스톤)

## 프로젝트 개요

**목표**: 팀 칸반 보드 MVP 완성  
**시간 예산**: 2~3시간 (반나절)  
**배포**: Vercel  
**기술 스택**: Next.js + shadcn/ui + @dnd-kit + Supabase  

---

## 마일스톤 요약

| # | 마일스톤 | 목표 | 예상 시간 | 결과물 |
|---|---------|------|---------|--------|
| M1 | 프로젝트 초기화 & Supabase 연동 | Next.js 프로젝트 + shadcn/ui 설정 + Supabase 클라이언트 | 20분 | 개발 환경 준비 |
| M2 | 칸반 보드 레이아웃 & 컬럼 표시 | 헤더 + 사이드바 + 보드 영역 레이아웃, 컬럼 목록 표시 | 25분 | 정적 UI 기본 구조 |
| M3 | 카드 CRUD & 컬럼 CRUD | 카드 생성/수정/삭제, 컬럼 추가/삭제/재정렬 기능 | 40분 | 데이터 입출력 완성 |
| M4 | 드래그&드롭 구현 (@dnd-kit) | 카드를 컬럼 간 이동, 컬럼 순서 변경 | 35분 | 인터랙션 완성 |
| M5 | Supabase Realtime 동기화 | 다른 클라이언트의 변경사항 실시간 반영 | 25분 | 협업 동기화 |
| M6 | 모바일 반응형 & 폴리시 마무리 | 반응형 디자인, 엣지 케이스, README 작성 | 20분 | 배포 준비 완료 |

**총 예상 시간**: 165분 ≈ 2시간 45분

---

## M1 — 프로젝트 초기화 & Supabase 연동 (20분)

### 목표
- Next.js 14 (App Router) 프로젝트 생성
- shadcn/ui 초기화 (Tailwind + 컴포넌트)
- Supabase 클라이언트 설정
- 환경 변수 설정

### 할 일

```
□ Next.js 프로젝트 생성
  $ npx create-next-app@latest kanban --typescript --tailwind --app
  
□ shadcn/ui 초기화
  $ npx shadcn-ui@latest init
  
□ 필요한 shadcn/ui 컴포넌트 추가
  $ npx shadcn-ui@latest add button input dialog card badge

□ @dnd-kit 설치
  $ npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

□ Supabase 클라이언트 라이브러리 설치
  $ npm install @supabase/supabase-js

□ lib/supabase.ts 작성 (Supabase 클라이언트 초기화)

□ .env.local 설정
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...

□ app/layout.tsx 기본 레이아웃 작성 (헤더, 글로벌 스타일)
```

### 검증 방법
- ✅ `npm run dev` 실행 후 localhost:3000 열기
- ✅ 기본 Next.js 페이지 보임
- ✅ console에 에러 없음 (Supabase 연결 테스트)

---

## M2 — 칸반 보드 레이아웃 & 컬럼 표시 (25분)

### 목표
- 3컬럼 레이아웃 (헤더 + 사이드바 + 칸반 영역)
- 데이터베이스의 컬럼 목록 조회 및 표시
- 반응형 기본 구조

### 할 일

```
□ 페이지 구조 작성
  ├─ app/page.tsx (메인 페이지)
  ├─ components/common/Header.tsx
  ├─ components/common/Sidebar.tsx
  ├─ components/common/Dashboard.tsx
  └─ components/board/Board.tsx (칸반 보드 컨테이너)

□ useBoard hook 작성
  - Supabase에서 columns, cards 조회
  - 초기 데이터 로드

□ Column 컴포넌트 작성
  - 컬럼 이름 + 카드 개수 배지 표시
  - 기본 스타일링 (위에 컬러 바)

□ Card 컴포넌트 작성 (기본 레이아웃)
  - 카드 제목 + 우선도 아이콘 + 기한 표시

□ Tailwind 반응형 설정
  - Desktop (1200px+): 3컬럼
  - Tablet (768~1200px): 2컬럼 + collapse 메뉴
  - Mobile (<768px): 1컬럼 + 하단 탭

□ 색상 토큰 정의 (lib/utils/constants.ts)
  - 우선도: high/medium/low 색상
  - 상태: To Do/In Progress/Review/Done 색상
```

### 검증 방법
- ✅ 칸반 보드 기본 레이아웃 보임
- ✅ Supabase의 컬럼 데이터 표시됨
- ✅ 반응형 작동 (브라우저 리사이즈 → 레이아웃 변경)
- ✅ 모바일 뷰에서도 가독성 있음

---

## M3 — 카드 CRUD & 컬럼 CRUD (40분)

### 목표
- 카드 생성, 수정, 삭제 기능
- 컬럼 추가, 삭제, 재정렬 기능
- Supabase 데이터 저장 및 로컬 상태 동기화

### 할 일

```
□ CardEditForm 컴포넌트 작성
  - 제목 입력 (필수)
  - 설명 입력 (선택)
  - 기한 선택 (선택, 날짜 picker)
  - 우선도 선택 (High/Medium/Low)
  - 제출/취소 버튼

□ CardModal 컴포넌트 작성
  - CardEditForm을 모달에 포함
  - shadcn/ui Dialog 사용
  - 닫기 버튼

□ useCards hook 작성
  - handleCreateCard(columnId, title, description, priority, dueDate)
  - handleUpdateCard(cardId, updates)
  - handleDeleteCard(cardId)
  - 각각 Supabase에 INSERT/UPDATE/DELETE

□ useColumns hook 작성
  - handleAddColumn(name)
  - handleDeleteColumn(columnId)
  - handleReorderColumns(columnIds) — position 업데이트
  - Supabase 쓰기

□ UI에 버튼 연결
  - Column 헤더: [+ 새 카드] 버튼 → 모달 열기
  - Column 헤더: [삭제] 버튼 → 컬럼 삭제
  - Card 클릭 → 모달 열기 (수정 모드)
  - Card 상세 모달: [삭제] 버튼 → 카드 삭제

□ 낙관적 업데이트 구현
  - 로컬 상태 먼저 업데이트
  - 화면 즉시 반영
  - Supabase 요청은 백그라운드 (실패 시 롤백)

□ 에러 처리 및 토스트
  - Supabase 오류 시 사용자 알림
  - toast UI (shadcn/ui 또는 기본 alert)

□ 폼 검증
  - 제목 필수 확인
  - 기한: 날짜 형식 검증
  - 빈 입력 방지
```

### 검증 방법
- ✅ 새 카드 추가 가능 → 화면에 보임 → Supabase에 저장됨
- ✅ 카드 수정 → 모달 열기 → 내용 변경 → 저장 → 화면 업데이트
- ✅ 카드 삭제 → 화면에서 사라짐
- ✅ 새 컬럼 추가 가능
- ✅ 컬럼 삭제 가능 (하위 카드도 삭제됨, ON DELETE CASCADE)
- ✅ 모바일에서도 모달 열기/닫기 작동

---

## M4 — 드래그&드롭 구현 (@dnd-kit) (35분)

### 목표
- @dnd-kit 통합으로 카드 간 순서 변경
- 카드를 다른 컬럼으로 이동
- 컬럼 순서도 드래그로 변경

### 할 일

```
□ useDragDrop hook 작성
  - DndContext 설정
  - handleDragEnd(event) 구현
    ├─ 같은 컬럼 내 카드 순서 변경
    ├─ 다른 컬럼으로 카드 이동
    └─ Supabase에 position/column_id 업데이트

□ Board 컴포넌트에 DndContext 래핑
  ```tsx
  <DndContext onDragEnd={handleDragEnd}>
    <div className="columns">
      {columns.map(col => <Column key={col.id} ... />)}
    </div>
  </DndContext>
  ```

□ Column 컴포넌트 드롭 영역 설정
  - useDroppable로 드롭 존 정의
  - 드롭 오버 시 배경 하이라이트

□ Card 컴포넌트 드래그 가능하게
  - useDraggable로 드래그 핸들 정의
  - 드래그 중 opacity 낮춤 (시각 피드백)

□ 드래그 오버 애니메이션
  - 컬럼 배경 연하게 강조 (transition)
  - 카드 hover 상태 그림자 추가

□ 모바일 터치 드래그 지원
  - @dnd-kit/core의 TouchSensor 활성화

□ 낙관적 업데이트
  - 드래그 완료 시 로컬 상태 먼저 변경
  - Supabase 쓰기 백그라운드
```

### 검증 방법
- ✅ 카드 드래그 → 다른 컬럼으로 이동 가능
- ✅ 같은 컬럼 내 카드 순서 변경 가능
- ✅ 컬럼 순서 변경 가능 (컬럼 헤더 드래그)
- ✅ Supabase 데이터 정확히 업데이트됨
- ✅ 모바일 터치 드래그 작동
- ✅ 애니메이션 부드러움

---

## M5 — Supabase Realtime 동기화 (25분)

### 목표
- 다른 클라이언트/브라우저의 변경사항 실시간 반영
- 카드, 컬럼 생성/수정/삭제 모두 동기화

### 할 일

```
□ useBoard hook에 Realtime 구독 추가
  - supabase.channel('board-changes') 생성
  - columns 테이블 구독 (INSERT/UPDATE/DELETE)
  - cards 테이블 구독 (INSERT/UPDATE/DELETE)
  - 각 이벤트에서 로컬 상태 업데이트

□ Realtime 이벤트 처리
  ```typescript
  INSERT → setCards([...cards, payload.new])
  UPDATE → setCards(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
  DELETE → setCards(prev => prev.filter(c => c.id !== payload.old.id))
  ```

□ 충돌 해결 로직
  - Realtime 이벤트의 timestamp vs 로컬 수정 시간 비교
  - 최신 버전 우선 (충돌 회피)

□ 변경 하이라이트 애니메이션
  - 다른 사용자의 카드 변경 시 1초간 배경색 변화
  - CSS transition으로 부드럽게

□ 연결 상태 표시 (선택)
  - 헤더에 "실시간 연결 중" 표시
  - 연결 끊김 시 "오프라인" 경고

□ 정리: cleanup function
  - 컴포넌트 언마운트 시 supabase.removeChannel()
```

### 검증 방법
- ✅ 2개의 브라우저 탭/창 열기
- ✅ 한쪽에서 카드 추가 → 다른 쪽에서 자동 반영
- ✅ 한쪽에서 카드 수정 → 다른 쪽에서 업데이트
- ✅ 한쪽에서 카드 삭제 → 다른 쪽에서 사라짐
- ✅ 모바일과 데스크톱 동시 열기 → 동기화 확인

---

## M6 — 모바일 반응형 & 폴리시 마무리 (20분)

### 목표
- 모바일/태블릿에서 완벽한 UX
- 엣지 케이스 처리
- README, .env.example, 배포 준비

### 할 일

```
□ 모바일 반응형 확인 및 수정
  - 모바일 (<768px): 1개 컬럼 가시, 좌우 스크롤
  - 컬럼 최소 너비 설정 (overflow-x auto)
  - 터치 드래그 작동
  - 모달 전체 화면 또는 대부분 차지

□ 폼 입력 최적화
  - 날짜 picker: 모바일에서도 터치 가능
  - 텍스트 입력: 자동 포커스 후 키보드 오픈

□ 엣지 케이스 처리
  - 빈 보드 (컬럼 없음) → 안내 메시지
  - 컬럼 없는 카드는 불가능 (DB 제약)
  - 긴 제목 텍스트 → 말줄임 또는 줄바꿈
  - 기한 임박 (12시간 전) → 빨강 강조
  - 매우 많은 카드 → 스크롤 성능 확인 (가상화는 v2)

□ 접근성 검토
  - 색깔 외 시각 신호 (우선도 아이콘 ✓)
  - 키보드 Tab 네비게이션 (shadcn/ui 자동)
  - 명도 대비 확인 (WCAG AA)

□ 로컬 스토리지 (선택)
  - 사용자 이름 저장 (v1에서는 임시 이름만)
  - 또는 모두 localStorage 제외 (서버 동기화로 충분)

□ README.md 작성
  - 프로젝트 설명
  - 설치 방법
  - 환경 변수 설정
  - 실행 방법
  - 배포 (Vercel)
  - v2 로드맵

□ .env.example 생성
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
  ```

□ .gitignore 확인
  - .env.local ✓
  - node_modules ✓
  - .next ✓

□ 빌드 및 배포 테스트
  - npm run build 성공
  - 배포 프리뷰 URL 생성
  - 배포된 버전에서 모든 기능 테스트
```

### 검증 방법
- ✅ 모바일 (스마트폰)에서 완벽하게 작동
- ✅ 엣지 케이스 모두 처리됨
- ✅ 빌드 에러 없음
- ✅ Vercel 배포 성공
- ✅ README 완성

---

## 시간 예산 트래킹

| M | 계획 | 실제 | 상태 |
|---|-----|------|------|
| M1 | 20분 | — | 대기 |
| M2 | 25분 | — | 대기 |
| M3 | 40분 | — | 대기 |
| M4 | 35분 | — | 대기 |
| M5 | 25분 | — | 대기 |
| M6 | 20분 | — | 대기 |
| **합계** | **165분** | — | **약 2시간 45분** |

### 시간 초과 시 스코프 축소

만약 시간이 부족하면 우선순위 순으로 축소:

1. **핵심 유지** (M1~M5): 기본 칸반 + 드래그&드롭 + Realtime
2. **선택 항목** (M6에서 축소 가능):
   - 엣지 케이스 처리 (일부 생략)
   - 모바일 세밀 조정 (기본 반응형만)
   - 접근성 (기본만)
3. **미룰 항목** (v2):
   - 다크 모드
   - 댓글/활동 로그
   - 사용자 인증
   - 고급 필터/검색

---

## 다음 단계

- ✅ 기획 7단계 완료 (01~07.md)
- 👉 **M1부터 구현 시작**
- Plan Mode: Shift+Tab으로 plan mode 켜서 M1 실행 순서 확인

