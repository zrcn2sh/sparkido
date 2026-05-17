# sparkido

**Idosquare** — 1인 개발자를 위한 아이디어(Spark) 등록과 실행 기록(Lab) 커뮤니티.

- **www** · 브랜드 소개 (`www.idosquare.co.kr`)
- **spark** · Spark / Lab 서비스 (`spark.idosquare.co.kr`)

> 아이디어는 누구나 가질 수 있지만, 실행의 궤적은 당신만의 것입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Auth | [Clerk](https://clerk.com) |
| Database | Cloudflare D1 (SQLite) |
| Deploy | Cloudflare Pages + Wrangler |
| 기획 | [`claude.md`](./claude.md) |

## 주요 기능 (MVP)

- **www** — 히어로, 슬로건, 브랜드 스토리, 비전 섹션
- **Spark** — 아이디어 등록 (Solo / Open), 진행 단계, 기술 스택
- **Lab** — Spark 상세 하단 타임라인 실행 기록
- **인증** — Clerk (Spark 등록·Lab 작성 시 로그인 필요)
- **로그인 이력** — Clerk Webhook → D1 `login_events` (배포 후 Endpoint 연결)

## 로컬 개발

### 요구 사항

- Node.js 18+
- npm

### 설치

```bash
git clone https://github.com/zrcn2sh/sparkido.git
cd sparkido
npm install
cp .env.example .env.local
```

`.env.local`에 Clerk 키와 Cloudflare 관련 값을 채웁니다. (`.env.example` 참고)

### D1 마이그레이션 (로컬)

```bash
npm run db:migrate:local
```

### 개발 서버

```bash
npm run dev
```

| URL | 설명 |
|-----|------|
| http://localhost:3000 | www (소개) |
| http://spark.localhost:3000 | spark (목록·등록) — hosts에 `127.0.0.1 spark.localhost` 추가 권장 |

### 기타 스크립트

```bash
npm run build          # 프로덕션 빌드
npm run lint           # ESLint
npm run db:migrate:remote   # 원격 D1 마이그레이션 (배포 DB)
```

## 프로젝트 구조

```
sparkido/
├── src/app/
│   ├── www/          # 소개·게시판
│   ├── spark/        # Spark 목록·상세·등록
│   ├── api/          # REST API, Clerk Webhook
│   └── sign-in/      # Clerk 로그인·회원가입
├── src/components/   # UI·도메인 컴포넌트
├── src/lib/          # D1, Spark/Lab, auth
├── migrations/       # D1 SQL 마이그레이션
├── middleware.ts     # 서브도메인 rewrite + Clerk
└── wrangler.toml     # Cloudflare D1 바인딩
```

## 환경 변수

민감한 값은 **절대 커밋하지 마세요.** `.env.example`을 복사해 `.env.local`을 만듭니다.

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk (클라이언트) |
| `CLERK_SECRET_KEY` | Clerk (서버) |
| `CLERK_WEBHOOK_SIGNING_SECRET` | 로그인 이력 Webhook (배포 후) |
| `NEXT_PUBLIC_WWW_URL` / `NEXT_PUBLIC_SPARK_URL` | 서브도메인 URL |
| `D1_DATABASE_ID` 등 | Cloudflare (배포·원격 DB) |

## 배포 (Cloudflare Pages)

1. GitHub 저장소 연결 후 빌드
2. D1 바인딩 (`DB`) 및 환경 변수 설정
3. `npm run db:migrate:remote`
4. Clerk에 프로덕션 도메인·Redirect URL 등록
5. (선택) Clerk Webhook → `https://your-domain/api/webhooks/clerk`

자세한 로드맵은 [`claude.md`](./claude.md)를 참고하세요.

## 라이선스

Private — Idosquare 프로젝트.
