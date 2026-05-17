## 프로젝트 개요

- **서비스명**: Ido (Idea + Do)
- **도메인**: `www.idosquare.co.kr` / `spark.idosquare.co.kr`
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
│   │   │   └── IdeaRouteBar.tsx
│   │   ├── fuel/
│   │   │   └── FuelBoost.tsx
│   │   └── common/
│   │       ├── TopNav.tsx
│   │       └── Layout.tsx
│   ├── lib/
│   │   ├── db.ts                 # D1 연결
│   │   ├── auth.ts               # 인증
│   │   └── utils.ts
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

  return NextResponse.rewrite(
    new URL(`/www${pathname}`, req.url)
  )
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
}
```

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
  - 진행 단계: `idea` | `validating` | `building` | `launched`
  - 기술 스택 태그 (선택)
  - 참여 방식: `solo` | `open`

### Lab (실행 기록)

- Spark 상세 페이지 하단에 타임라인 형태로 표시
- Lab 상단 메뉴 없음 — Spark 상세 안에서만 접근
- `spark_id` 자동 주입 (선택 불필요)
- Lab 타입 태그: `개발` | `리서치` | `고객 인터뷰` | `AI 프롬프트` | `디자인` | `피벗` | `출시`
- 마크다운 + 코드블록 지원
- 작성자가 Spark 작성자와 달라도 됨 (Open Do)

### Idea Route Bar

- Spark 상세 페이지 좌측 20% 고정
- 이 Spark의 진행 흐름을 노선도로 시각화
- Lab 추가 시 노드 자동 생성 (직접 그리지 않음)
- 노드 상태:
  - `⚡ Spark` — 현재 진행 중 (파란 원)
  - `✓ 완료` — Lab 기록 완료 (초록 원)
  - `💡 Bulb` — 배포 완료 (전구)
  - `○ 예정` — 미래 마일스톤 (점선 원, 흐리게)
- 분기 규칙:
  - Solo Do: 분기 없음, 단일 선
  - Open Do: 병렬 Lab 발생 시 자동 분기
  - 최대 depth 2단계
- 모바일: 상단 진행바로 전환

### Fuel & Boost (피드백)

- Spark 상세 페이지 우측 20%
- 리액션 종류: `응원하기` | `기술 지원` | `시장성 확인`
- 전압(Voltage): 리액션 누적 → Spark 관심도 지표
- 모바일: 하단 접이식

---

## UI 레이아웃 — 20:60:20

```
┌─────────────────────────────────────────┐
│           상단 네비게이션 (TopNav)         │
├──────────┬──────────────────┬───────────┤
│ Left 20% │   Center 60%     │ Right 20% │
│          │                  │           │
│ Idea     │ Spark 정보 카드  │ Fuel &    │
│ Route    │ ──────────────   │ Boost     │
│ Bar      │ Lab History      │           │
│          │ [Lab 입력창]     │ 전압 표시  │
└──────────┴──────────────────┴───────────┘
```

---

## DB 테이블 구조

```sql
-- 아이디어
Sparks (
  id, author_id, mode TEXT CHECK(mode IN ('solo','open')),
  title, content, stage, voltage INTEGER DEFAULT 0,
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

Phase 3 — 고도화
  [ ] 전압(Voltage) 알고리즘
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
- 단계 컬러: 아이디어(gray) → 검증(amber) → 개발(blue) → 출시(teal)
- Fuel & Boost: Pink
- 폰트 크기: 12px(small) / 14px(body) / 16px(h3) / 18px(h2) / 22px(h1)
- 폰트 굵기: 400(regular) / 500(bold) — 600/700 사용 금지
- 보더: 0.5px solid
- 라운드: md(8px) / lg(12px)

*작성일: 2025.05.17 — Ido 프로젝트 기획 확정*
