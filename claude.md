## 프로젝트 개요

- **서비스명**: Ido (Idea + Do)
- **도메인**: `www.idosquare.co.kr` / `spark.idosquare.co.kr` / `show.idosquare.co.kr`
- **슬로건**: 아이디어는 누구나 가질 수 있지만, 실행의 궤적은 당신만의 것입니다
- **목적**: 1인 개발자가 아이디어(Spark)를 등록하고 실행 과정(Lab)을 기록하는 커뮤니티 플랫폼

---

## 기술 스택

```
Frontend  : Next.js 14 App Router, TypeScript, Tailwind CSS
Backend   : Cloudflare Workers (Node.js)
Database  : Cloudflare D1 (SQLite)
Storage   : Cloudflare R2
Deploy    : Cloudflare Pages
Auth      : Lucia Auth 또는 Clerk
Email     : Resend
```

---

## 프로젝트 구조

```
idosquare/
├── src/
│   ├── app/
│   │   ├── www/                  # www.idosquare.co.kr
│   │   │   ├── page.tsx          # 소개 페이지
│   │   │   ├── board/            # 게시판
│   │   │   └── layout.tsx
│   │   ├── spark/                # spark.idosquare.co.kr
│   │   │   ├── page.tsx          # Spark 목록
│   │   │   ├── [id]/             # Spark 상세
│   │   │   │   └── page.tsx
│   │   │   ├── new/              # Spark 등록
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── show/                 # show.idosquare.co.kr
│   │   │   ├── page.tsx          # Show 쇼케이스 그리드
│   │   │   └── layout.tsx
│   │   └── _shared/              # 공통
│   │       ├── components/
│   │       ├── lib/
│   │       └── types/
│   ├── components/
│   │   ├── spark/
│   │   │   ├── SparkCard.tsx
│   │   │   ├── SparkForm.tsx
│   │   │   └── SparkDetail.tsx
│   │   ├── lab/
│   │   │   ├── LabTimeline.tsx
│   │   │   ├── LabForm.tsx
│   │   │   └── LabItem.tsx
│   │   ├── route-bar/
│   │   │   └── SparkParticipantsPanel.tsx
│   │   ├── fuel/
│   │   │   └── SparkCheerPanel.tsx
│   │   ├── show/
│   │   │   ├── ShowMain.tsx
│   │   │   ├── ShowViewport.tsx
│   │   │   ├── ShowTripletGrid.tsx
│   │   │   ├── ShowTileCard.tsx
│   │   │   ├── ShowTileModal.tsx
│   │   │   └── ShowRegisterDialog.tsx
│   │   └── common/
│   │       ├── TopNav.tsx
│   │       └── Layout.tsx
│   ├── lib/
│   │   ├── db.ts                 # D1 연결 (서버 전용 — 클라이언트에서 import 금지)
│   │   ├── auth.ts               # 인증
│   │   ├── show-grid.ts          # 6×9 그리드 상수
│   │   ├── show-selection.ts     # 빈 칸 선택·직사각형 검증·P1–P2 연결
│   │   ├── show-config.ts        # Fuel 견적·타입 (클라이언트 OK)
│   │   ├── show-fuel.ts          # Admin 설정 로드 (서버 전용)
│   │   ├── show-tiles.ts         # 타일 CRUD
│   │   ├── show-carousel.ts      # 3페이지 슬라이드 윈도우
│   │   └── utils.ts
│   ├── app/api/show/
│   │   ├── pages/route.ts        # GET 목록 · POST 타일 등록
│   │   └── fuel-rates/route.ts   # Fuel·등록 크기 한도 (공개)
│   └── types/
│       └── index.ts
├── middleware.ts                  # 서브도메인 라우팅
├── claude.md
├── .env.local
└── wrangler.toml                  # Cloudflare 설정
```

---

## 서브도메인 라우팅

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  if (host.startsWith('spark.')) {
    return NextResponse.rewrite(
      new URL(`/spark${pathname}`, req.url)
    )
  }

  if (host.startsWith('show.')) {
    return NextResponse.rewrite(
      new URL(`/show${pathname === '/' ? '' : pathname}`, req.url)
    )
  }

  return NextResponse.rewrite(
    new URL(`/www${pathname}`, req.url)
  )
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
}
```

실제 라우팅·URL 헬퍼는 `src/lib/routes.ts`, `src/middleware.ts`(Clerk 세션 등)에 구현됨.

---

## 핵심 기능 상세

### Spark (아이디어 등록)

- 아이디어를 최초 제안하는 게시물
- **Solo Do**: 작성자만 Lab 작성 가능. 선점 증명 목적
- **Open Do**: 누구나 Lab 참여 가능. 분기 생성 허용
- 등록 필드:
  - 어떤 불편함을 해결하고 싶나요? (필수)
  - 누가 이 문제를 겪나요? (필수)
  - 어떻게 풀 생각인가요? (필수)
  - Lab 단계: `idea` · `build` · `live` (3단계)
  - 기술 스택 태그 (선택)
  - 참여 방식: `solo` | `open`

### Lab (실행 기록)

- Spark 상세 페이지 하단에 타임라인 형태로 표시
- Lab 상단 메뉴 없음 — Spark 상세 안에서만 접근
- `spark_id` 자동 주입 (선택 불필요)
- Lab 타입 태그: `개발` | `리서치` | `고객 인터뷰` | `AI 프롬프트` | `디자인` | `피벗` | `출시`
- 마크다운 + 코드블록 지원
- 작성자가 Spark 작성자와 달라도 됨 (Open Do)

### 참여자 패널 (좌측 20%, `SparkParticipantsPanel`)

- Spark 상세 좌측(데스크톱)·상단(모바일) — **Idea Route 미사용**
- Spark 작성자 + Lab을 남긴 참여자 목록 (Teal / Blue / Amber 색 구분)
- **전체** 또는 참여자 선택 → Lab History에 해당 사용자 기록만 표시
- `SparkDetailLayout`에서 `selectedDoerId` 상태·`filterLabLogsByDoer` 필터

### 응원 (Spark 상세 우측 20%)

- **응원 수**: 이 Spark에 달린 응원 횟수 (하트 UI)
- **Fuel**: 사용자 계정 포인트만 (상단 네비). Spark 상세에는 표시하지 않음
- Spark·Lab·응원·**로그인(KST 1일 1회, `login_day` 원장)**·**회원가입(1회)** 시 Fuel 적립 — Admin `fuel_login`·`fuel_signup`
- 로그인 Fuel: Clerk `session.created` 웹훅 + **미들웨어** `enrich-login-browser` + **`POST /api/users/me/fuel/earn-login`**
- 회원가입 Fuel: Clerk `user.created` 웹훅 + **`POST /api/users/me/fuel/earn-signup`** + 온보딩 `/onboarding/nickname` (계정당 1회)
- 모바일: 하단 접이식

### Show (쇼케이스 광장)

- **URL**: `show.idosquare.co.kr` (로컬: `show.localhost:3000` 또는 `/show`)
- **목적**: 사용자가 만든 서비스·앱을 타일 형태로 전시하는 쇼케이스
- **카피**: 「사용자가 만든 서비스 및 앱을 보여주는 쇼케이스 광장」
- **레이아웃**: Spark 목록과 동일 `SparkPageShell` `max-w-7xl` (`width="xl"`)

#### 그리드

- 페이지당 **6열 × 9행** 정사각 셀 (`SHOW_GRID_COLS` / `SHOW_GRID_ROWS`)
- 빈 칸은 회색 슬롯으로 개별 표시
- 셀·페이지(P1|P2) 사이 간격: `gap-0.5 sm:gap-1` (페이지 경계에 별도 border 없음)
- **캐러셀**: 데스크톱(sm 이상) 3페이지(P1·P2·P3) → P2·P3·P4 → … / **모바일** 1페이지씩 P1 → P2 → … (`buildShowPageWindows`, `useShowVisiblePageCount`)
- **P1–P2 가로 연결**: 인접 페이지만 선택 가능. 전역 좌표로 축 정렬 직사각형이면 하나의 타일로 등록
  - DB: 동일 `placement_group_id`로 묶음, `ShowTripletGrid`에서 18열 통합 렌더(이미지 분할 없음)

#### 타일 등록 (로그인 후)

- 빈 칸 다중 선택 → **타일 등록** / **타일 초기화** (선택 시에만 활성)
- 선택은 **직사각형·정사각형**만 허용 (`selectionToPlacements`)
- 등록 크기: **1×1 ~ Admin 설정 최대 가로×세로** (기본 4×4, 그리드 상한 6×9 이하)
- 등록 버튼 왼쪽 **사용 Fuel** 견적: **일 ⚡ (1일 단가) · 이번 달 ⚡ (1일×잔여일)**
- **잔여일**: KST, **등록 당일 포함** ~ 월말
- 등록 시 `periodFuel`만큼 Fuel **차감** (`spendUserFuel`) — **알파 기간**(`is_alpha_period`)에는 차감 없음
- **알파 기간**: Admin 기본설정 체크박스 · 상단 Idosquare 오른쪽 **α** 배지 · Spark·Lab·응원 적립 유지
- **매월 1일 0시(KST)** 활성 타일 전체 소프트 삭제 (Cron) · 관리자 **`/admin/show`** 에서 전체 삭제(확인 팝업)
- **이력** `show_tile_events`: 등록·게시 취소·전체 삭제 — Admin **`/admin/show/history`**
  - 등록·게시 취소 `meta_json.placements`: `{ pageIndex, col, row, width, height }[]` (0-based) + `placementSummary`
- 상세 모달: 이미지 `object-contain`, 확대 없음
- **써봤어요·추천해요**: `show_tile_reactions` · `POST /api/show/tiles/[id]/reactions` · 메인 타일에 추천 수(ThumbsUp) 배지

#### Admin · 기본설정 (`/www/admin/settings`)

`point_settings` 컬럼으로 Show 정책 관리:

| 항목 | 컬럼 | 설명 |
|------|------|------|
| 기본 Fuel (1일) | `show_fuel_base` | 1×1 타일 하루 (기본 10) |
| 가로 추가 (1일) | `show_fuel_per_col` | 가로 1칸·하루 (기본 8) |
| 세로 추가 (1일) | `show_fuel_per_row` | 세로 1칸·하루 (기본 8) |
| 최대 가로 칸 | `show_tile_max_cols` | 등록 허용 가로 (기본 4, ≤6) |
| 최대 세로 칸 | `show_tile_max_rows` | 등록 허용 세로 (기본 4, ≤9) |
| 알파 기간 | `is_alpha_period` | 1=Show Fuel 미차감·α 배지 (기본 1) |

**Fuel 산식** (Admin 값은 **1일 단가**, 바운딩 박스·P1–P2 연결 포함):

```
1일 Fuel = base + (가로−1)×perCol + (세로−1)×perRow
당월 청구 = 1일 Fuel × 잔여일(KST, 등록 당일 포함)
```

#### API

- `GET /api/show/pages` — 페이지별 타일 목록
- `POST /api/show/pages` — 타일 등록 (`placements[]` 또는 단일 좌표)
- `POST /api/show/tiles/[id]/reactions` — 써봤어요(`tried`)·추천해요(`recommend`), 계정·타일당 1회
- `GET /api/show/fuel-rates` — `{ rates, sizeLimits, remainingDaysInMonth, isAlphaPeriod }`
- `DELETE /api/admin/show/tiles` — 관리자 Show 타일 전체 삭제 (`/admin/show`)
- `GET /api/admin/show/events` — Show 등록·취소·전체 삭제 이력 (`/admin/show/history`)
- `POST /api/internal/show/purge-tiles` — 월간 Cron (`SHOW_CRON_PURGE_SECRET`)

#### 모듈 분리 (번들 주의)

- **`show-config.ts`**: 타입·`quoteShowSelectionFuel` — **클라이언트 컴포넌트에서 import**
- **`show-fuel.ts`**: `getShowPublicConfig` 등 — `fuel-settings` → `db` → wrangler 사용, **클라이언트에서 직접 import 금지**

#### DB 마이그레이션

- `0018_show_tiles.sql` — `show_tiles` 테이블
- `0019_show_tile_placement_group.sql` — `placement_group_id`
- `0020_show_fuel_settings.sql` — Fuel 산식 컬럼
- `0021_show_tile_max_size.sql` — 최대 가로·세로 컬럼
- `0022_show_monthly_purges.sql` — 월간 Cron 멱등 기록
- `0025_alpha_period.sql` — `is_alpha_period`
- `0026_show_tile_events.sql` — Show 등록·삭제 이력 (`show_tile_events`)
- `0027_show_tile_category_v2.sql` — 구분 5종 (웹·앱·API/툴·브라우저확장·기타)
- `0028_fuel_login_signup.sql` — 로그인·회원가입 Fuel 컬럼
- `0029_fuel_login_day_unique.sql` — 로그인 Fuel 일 1회 유니크 인덱스
- `0030_show_tile_reactions.sql` — Show 써봤어요·추천해요

로컬: `npm run db:migrate:local` · 배포: `npm run db:migrate:remote`

**Cron (KST 매월 1일 0시)**: `0 0 1 * *` → `POST /api/internal/show/purge-tiles`  
(Cloudflare Cron Trigger 또는 외부 스케줄러, 헤더 `x-sparkido-cron-secret`)

#### 타일 필드 (등록)

- `category`(구분): `web` | `app` | `api_tool` | `browser_extension` | `other` — 웹·앱·API/툴·브라우저확장·기타
- `kind`: DB 호환 (`app` 구분만 `app`, 나머지 `web`)
- `title`, `tagline`, `linkUrl`(필수), `imageUrl` 또는 `iconText`(이모지) 중 하나

#### Fuel 원장 (`fuel_ledger` + `src/lib/fuel-ledger.ts`)

| kind | 의미 |
|------|------|
| `earn_spark` / `earn_lab` / `earn_cheer` / `earn_login` / `earn_signup` | 적립 (total·available ↑) |
| `spend_show_tile` | Show 등록 청구 (available ↓) |
| `refund_show_unused` | 미사용 일수 환불 (available ↑, `related_ledger_id`→spend) |
| `refund_show_removed` | 타일 제거·월말 삭제 시 환불 |

- 모든 `addUserFuel` / `spendUserFuel` / `refundUserFuel` 호출이 원장에 기록됨
- Show 등록: `show_tiles`에 `fuel_*` 스냅샷 + `refund_show_unused`는 `show-fuel-refund.ts`로 일수 계산 (미연동 시 추후)

#### 미구현·추후

- 타일 삭제·월말 purge 시 `refund_show_unused` 자동 호출
- 타일 수정 UI
- Cloudflare Cron 배포 설정 (`wrangler.toml` triggers)
- Admin `/admin/fuel` Fuel 원장 조회 (사용자·KST 기간, 잔액)

---

## UI 레이아웃 — 20:60:20

```
┌─────────────────────────────────────────┐
│           상단 네비게이션 (TopNav)         │
├──────────┬──────────────────┬───────────┤
│ Left 20% │   Center 60%     │ Right 20% │
│          │                  │           │
│ Idea     │ Spark 정보 카드  │ 응원      │
│ Route    │ ──────────────   │ 패널      │
│ Bar      │ Lab History      │           │
│          │ [Lab 입력창]     │ 응원 수   │
└──────────┴──────────────────┴───────────┘
```

---

## DB 테이블 구조

```sql
-- 아이디어
Sparks (
  id, author_id, mode TEXT CHECK(mode IN ('solo','open')),
  title, content, stage, fuel INTEGER DEFAULT 0,
  created_at, updated_at
)

-- 실행 분기
Labs (
  id, spark_id, doer_id,
  status TEXT CHECK(status IN ('building','live')),
  parent_lab_id,
  created_at
)

-- 단계별 기록
Lab_Logs (
  id, lab_id, step_number INTEGER,
  type TEXT, content, prompt_text, code_snippet,
  created_at
)

-- 피드백
Fuels (
  id, target_id, target_type TEXT,
  user_id, energy_type TEXT,
  created_at
)

-- Show 쇼케이스 타일 (0018+)
show_tiles (
  id, owner_id, placement_group_id,  -- P1–P2 연결 시 동일 UUID
  page_index, col, row, width, height,
  title, tagline, kind, category,
  image_url, icon_text, link_url,
  status, created_at, updated_at
)

-- Show 정책은 point_settings 확장 (0020, 0021)
-- show_fuel_base, show_fuel_per_col, show_fuel_per_row,
-- show_tile_max_cols, show_tile_max_rows

-- Fuel 원장 (0023) — 적립·사용·환불 이력. 잔액은 user_fuel
fuel_ledger (
  id, clerk_user_id, kind,
  delta_available, delta_total,  -- 사용/환불 시 total=0
  available_after, total_after,
  ref_type, ref_id, related_ledger_id,  -- 환불→원 spend id
  meta_json, created_at
)

-- Show 타일 청구 스냅샷 (0024, 환불 계산용)
-- fuel_ledger_id, fuel_daily, fuel_period_charged,
-- fuel_billing_month, fuel_remaining_days
```

---

## 개발 우선순위

```
Phase 1 — MVP
  [ ] Next.js 프로젝트 세팅
  [ ] 서브도메인 middleware 설정
  [ ] D1 DB 연결 및 테이블 생성
  [ ] 인증 (회원가입/로그인)
  [ ] www 소개 페이지 + 게시판
  [ ] Spark 목록 페이지
  [ ] Spark 등록 화면
  [ ] Spark 상세 + Lab 타임라인

Phase 2 — 핵심 기능
  [ ] Idea Route Bar 컴포넌트
  [ ] Fuel & Boost 패널
  [ ] Open Do 참여 기능
  [ ] 알림 시스템
  [ ] 마크다운 + 코드블록 렌더링
  [x] Show 서브도메인·6×9 그리드·3페이지 캐러셀
  [x] Show 타일 등록·P1–P2 연결·상세 모달
  [x] Show Fuel 견적(1일×잔여일)·등록 차감·크기 한도 (Admin)
  [x] Show 타일 전체 삭제(관리자·Cron API)
  [ ] Show Cloudflare Cron 트리거 배포

Phase 3 — 고도화
  [ ] Fuel 한도 알고리즘 고도화
  [ ] 모바일 반응형
  [ ] Cursor MCP 연동
  [ ] SEO 최적화
```

---

## 환경변수 (.env.local)

```env
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
D1_DATABASE_ID=
R2_BUCKET_NAME=
RESEND_API_KEY=
NEXTAUTH_SECRET=
NEXT_PUBLIC_WWW_URL=https://www.idosquare.co.kr
NEXT_PUBLIC_SPARK_URL=https://spark.idosquare.co.kr
NEXT_PUBLIC_SHOW_URL=https://show.idosquare.co.kr
```

---

## 코딩 규칙

- 언어: TypeScript 엄격 모드
- 스타일: Tailwind CSS, 인라인 스타일 사용 금지
- 컴포넌트: 함수형, React Server Component 우선
- 상태관리: useState/useReducer, 전역 상태 최소화
- API: Next.js Route Handler (`app/api/`)
- 에러 처리: 모든 API에 try/catch 필수
- 주석: 복잡한 로직에만, 한국어로 작성
- **Show**: 클라이언트는 `@/lib/show-config`만 import. `@/lib/show-fuel`·`fuel-settings`·`db`는 서버(Route Handler·Server Component)에서만

---

## Cursor 작업 시작 방법

```
1단계: "claude.md를 읽고 프로젝트 구조와 middleware.ts를 먼저 만들어줘"
2단계: "D1 DB 연결 설정하고 테이블 스키마 생성 쿼리 작성해줘"
3단계: "www 소개 페이지 컴포넌트부터 만들어줘"
4단계: "Spark 목록 페이지와 SparkCard 컴포넌트 만들어줘"
```

---

## 디자인 시스템
- 메인 컬러: Teal (#1D9E75)
- 단계 컬러: 아이디어(gray) → 만들기(blue) → 출시(teal)
- Fuel & Boost: Pink
- 폰트 크기: 12px(small) / 14px(body) / 16px(h3) / 18px(h2) / 22px(h1)
- 폰트 굵기: 400(regular) / 500(bold) — 600/700 사용 금지
- 보더: 0.5px solid
- 라운드: md(8px) / lg(12px)

## Spark 권한 정책:
- Spark 삭제: 관리자만 가능 (Lab·응원 기록 포함)
- Spark 수정: 작성자 또는 관리자
- Spark 비공개: A(작성자)만 가능
  단, B의 Lab이 1개 이상이면 비공개 전환 시 경고 표시
  "이 Spark에 다른 참여자의 기록이 있습니다"
- Lab 비공개: 각 작성자 본인만 가능
- Open Do → Solo Do 전환:
  참여자 Lab이 없을 때만 허용

Idea Route Bar 구현 지시 (Cursor용)
개요
Spark 상세 페이지 좌측 20%에 배치
이 Spark의 진행 흐름을 노선도로 시각화
Lab 기록이 추가될 때마다 자동으로 노드 생성
사용자가 직접 그리지 않음

사용 라이브러리
react-flow (reactflow)
npm install reactflow

분기 규칙
메인 라인: Spark 작성자 (author_id 기준, 항상 1개)
분기 라인: Lab.user_id ≠ Spark.author_id 인 경우 자동 생성
           동일 user_id면 기존 라인에 노드 추가
           참여자 3명 이상: 2개 라인 + "+N명" 접이식

합류: 없음
최대 depth: 2단계

노드 타입
typescripttype NodeStatus =
  | 'spark'    // Spark 최초 등록 (항상 첫 노드)
  | 'active'   // 현재 진행 중 (가장 최근 노드)
  | 'done'     // 완료된 노드
  | 'pivot'    // 피벗 발생
  | 'future'   // 예정 마일스톤 (점선)

노드 색상
typescriptconst nodeColors = {
  author:       '#1D9E75', // Teal  — 작성자 메인 라인
  participant1: '#378ADD', // Blue  — 참여자 1
  participant2: '#EF9F27', // Amber — 참여자 2
  participants: '#888780', // Gray  — 참여자 3명+
  pivot:        '#EF9F27', // Amber — 피벗 노드
  future:       '#C0BDB4', // Gray  — 예정 노드 (점선)
}

라인 스타일
typescriptconst edgeStyles = {
  main:   { stroke: '#1D9E75', strokeWidth: 2 },
  branch: { stroke: '#378ADD', strokeWidth: 1.5 },
  pivot:  { stroke: '#EF9F27', strokeWidth: 1.5,
            strokeDasharray: '4,4' },
  future: { stroke: '#C0BDB4', strokeWidth: 1,
            strokeDasharray: '3,4' },
}

노드 자동 생성 로직
typescriptfunction buildRouteNodes(spark: Spark, labs: Lab[]) {

  // 1. 첫 노드 — Spark 등록
  const nodes = [{
    id: `spark-${spark.id}`,
    type: 'sparkNode',
    status: 'spark',
    label: 'Spark 등록',
    date: spark.created_at,
    userId: spark.author_id,
    line: 'main'
  }]

  // 2. Lab 기록으로 노드 생성
  //    작성자 → 메인 라인
  //    다른 사용자 → 분기 라인 (user_id별로 구분)
  const participantLines: Record<string, string> = {}
  let participantCount = 0

  labs.forEach(lab => {
    const isAuthor = lab.user_id === spark.author_id
    let line = 'main'

    if (!isAuthor) {
      if (!participantLines[lab.user_id]) {
        participantCount++
        participantLines[lab.user_id] =
          participantCount === 1 ? 'branch1' :
          participantCount === 2 ? 'branch2' : 'branchGroup'
      }
      line = participantLines[lab.user_id]
    }

    nodes.push({
      id: `lab-${lab.id}`,
      type: lab.type === '피벗' ? 'pivotNode' : 'labNode',
      status: lab.type === '피벗' ? 'pivot' : 'done',
      label: lab.type,
      date: lab.created_at,
      userId: lab.user_id,
      line
    })
  })

  // 3. 예정 마일스톤 — 항상 하단에 고정
  if (spark.stage !== 'live') {
    nodes.push({
      id: 'future-live',
      type: 'futureNode',
      status: 'future',
      label: '🚀 Live',
      line: 'main'
    })
  }

  return nodes
}

컴포넌트 구조
IdeaRouteBar
  ├── RouteFlow (react-flow)
  │    ├── SparkNode      (첫 노드)
  │    ├── LabNode        (일반 Lab)
  │    ├── PivotNode      (피벗 Lab, Amber + PIVOT 레이블)
  │    ├── FutureNode     (예정, 점선 원)
  │    └── BranchGroup    (참여자 3명+, 접이식)
  └── RouteBarSkeleton   (로딩 상태)

노드 클릭 동작
typescript// 노드 클릭 시 해당 Lab 카드로 스크롤
onNodeClick={(_, node) => {
  const element = document.getElementById(`lab-${node.id}`)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}}

모바일 대응
모바일 (<768px):
  Route Bar 숨김
  대신 상단에 진행 상태 바로 표시

// 상단 진행바 컴포넌트
<StageProgressBar
  stages={['Idea', 'Validate', 'Build', 'Live']}
  current={spark.stage}
  hasBranch={participantCount > 0}
/>
