# sparkido

**Idosquare** — 1인 개발자를 위한 아이디어(Spark) 등록과 실행 기록(Lab) 커뮤니티.

- **spark** · 메인 · Spark / Lab (`spark.idosquare.co.kr`, `www` 루트는 여기로 리다이렉트)
- **info** · 회사 소개 (`info.idosquare.co.kr`)
- **board** · 게시판 (`board.idosquare.co.kr`)
- **admin** · 관리자 (`admin.idosquare.co.kr`)
- **www** · 개인정보 등 (`www.idosquare.co.kr`, 루트는 Spark로 리다이렉트)

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
| `NEXT_PUBLIC_WWW_URL` / `NEXT_PUBLIC_INFO_URL` / `NEXT_PUBLIC_BOARD_URL` / `NEXT_PUBLIC_ADMIN_URL` / `NEXT_PUBLIC_SPARK_URL` / `NEXT_PUBLIC_SHOW_URL` | 서브도메인 URL |
| `D1_DATABASE_ID` 등 | Cloudflare (배포·원격 DB) |

## 배포 (Cloudflare Workers + OpenNext)

Git **Create application** → `zrcn2sh/sparkido`

| 항목 | 값 |
|------|-----|
| Build command | `npm run cf:build` |
| Deploy command | `npm run cf:deploy` (`--minify` 포함). CI에서 Build 후에는 **`npm run deploy` 대신 `cf:deploy`만** 실행해 이중 빌드 방지 |

**Worker 크기:** `getDb()`에서 `wrangler` CLI를 직접 import하면 번들에 **wrangler+miniflare(~11MB)** 가 들어갑니다. `getCloudflareContext().env.DB`만 쓰면 gzip **약 1.5 MiB** (`--minify` 기준)로 **Workers Free(3 MiB)** 에도 배포 가능합니다. Deploy는 `npm run cf:deploy`(`--minify` 포함) 권장.

로컬: `npm run dev` · Workers 미리보기: `npm run preview` · 배포: `npm run deploy`

1. Worker 프로젝트 **sparkido**에 D1 바인딩 (`DB`) 및 env 설정 (아래 Clerk 표 참고)
2. `nodejs_compat` (Functions 호환 플래그)
3. `npm run db:migrate:remote` (아래 D1 오류 참고)
4. Clerk — **기존 Idosquare 앱 키 재사용** (새 Clerk 앱 불필요). **Build variables**에 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 필수 (없으면 `useAuth` / ClerkProvider 오류)
5. Clerk 프로덕션 도메인·Redirect URL (`*.workers.dev` 또는 커스텀 도메인)
6. (선택) Clerk Webhook → `https://your-domain/api/webhooks/clerk`

### Clerk env (Cloudflare Workers Builds)

| 변수 | 어디에 | 비고 |
|------|--------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Build variables** | 빌드 시 클라이언트에 박힘. Secret만 넣으면 안 됨 |
| `CLERK_SECRET_KEY` | **Secrets** (런타임) | 미들웨어·API용 |
| `CLERK_WEBHOOK_SIGNING_SECRET` 등 | **Secrets** | Webhook 사용 시 |

값 변경 후 **반드시 재배포**(Build부터 다시).

### show / info에서 403 (Clerk)

`spark`는 되는데 **`show.idosquare.co.kr` · `info.idosquare.co.kr`만 403**이면, HTML은 열리지만 브라우저가 Clerk Frontend API를 막는 경우가 많습니다. (개발자 도구 → Network에서 `clerk` / `frontend-api` 요청이 **403**인지 확인)

**Clerk Dashboard (프로덕션 인스턴스, `pk_live_…` 키와 동일 앱)**

1. **Configure → Domains**
   - Production **root domain**: `idosquare.co.kr` (또는 Clerk에 등록한 기본 도메인)
2. **Allowed Subdomains** ([문서](https://clerk.com/docs/guides/dashboard/dns-domains/subdomain-allowlist))
   - **Enable allowed subdomains**가 켜져 있으면, 아래를 **모두** 추가해야 합니다.
   - `www.idosquare.co.kr`
   - `spark.idosquare.co.kr`
   - `show.idosquare.co.kr`
   - `info.idosquare.co.kr`
   - (빠진 서브도메인만 FAPI 403)
   - 또는 보안 요구가 낮으면 **Enable allowed subdomains 끄기** → 모든 서브도메인 허용
3. **Paths / Redirect URLs** (메뉴명은 버전에 따라 다름)
   - Sign-in·Sign-up 후 돌아올 URL에 각 호스트 허용, 예:
   - `https://show.idosquare.co.kr/*`
   - `https://info.idosquare.co.kr/*`
   - `https://spark.idosquare.co.kr/*`
   - `https://www.idosquare.co.kr/*`
   - `https://board.idosquare.co.kr/*`
   - `https://admin.idosquare.co.kr/*`
4. **Cloudflare Workers Builds**
   - Build variables에 `NEXT_PUBLIC_SHOW_URL`, `NEXT_PUBLIC_INFO_URL` 포함 (앱이 `allowedRedirectOrigins`에 반영)
   - 변경 후 **재빌드·재배포**

앱은 show·info 페이지를 **비로그인 열람** 가능하게 두었습니다. 403이 **전체 페이지**(Cloudflare HTML)이면 Custom Domain·WAF를, **Clerk API만** 403이면 위 Dashboard 설정을 우선 확인하세요.

### D1 API 오류가 날 때

`A request to the Cloudflare API (.../d1/database/.../query) failed` 는 보통 아래 중 하나입니다.

| 원인 | 확인·조치 |
|------|-----------|
| **원격 마이그레이션 미적용** | `npm run db:migrate:remote` 실행. 최근 추가: `0010_user_roles`, `0011_board_comments` |
| **D1 바인딩 없음** | Dashboard → **sparkido** Worker → Settings → Bindings → D1 이름 **`DB`**, DB `sparkido` |
| **Wrangler 로그인/토큰** | `npx wrangler login` 또는 `CLOUDFLARE_API_TOKEN` (D1 Edit 권한) |
| **컬럼 없음** (배포 직후) | `npx wrangler d1 execute sparkido --remote --command "PRAGMA table_info(user_profiles);"` 에 `role` 있는지 확인 |

원격 DB 상태 확인:

```bash
npx wrangler d1 execute sparkido --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

마이그레이션만 다시 적용:

```bash
npm run db:migrate:remote
```

### www.idosquare.co.kr 접속이 안 될 때

`spark` / `info` / `show`는 되는데 **www만 안 되면** 앱 코드가 아니라 **Cloudflare DNS·리다이렉트** 문제인 경우가 많습니다.

| 증상 | 원인 | 조치 |
|------|------|------|
| `www` → `https://idosquare.co.kr/...` 로 **301** (응답에 `x-opennext` 없음) | Zone **Redirect Rule** 등으로 www가 apex로만 보냄 | Dashboard → **Rules** → Redirect Rules에서 `www` → apex 규칙 **삭제** |
| apex(`idosquare.co.kr`) DNS 없음 / 연결 실패 | apex 레코드 미설정 | Worker **Custom Domains**에 `www.idosquare.co.kr` 추가 (또는 `wrangler.toml`의 `[[routes]]` deploy 후 확인) |
| www 루트만 Spark로 가고 “www가 안 됨” | 의도된 동작 | 게시판은 **`https://www.idosquare.co.kr/board`** 로 접속 |

**권장 설정 (Cloudflare)**

1. **Workers & Pages** → **sparkido** → **Settings** → **Domains & Routes** → Custom Domain: `www.idosquare.co.kr` (spark·info·show와 동일)
2. **Rules** → www를 `idosquare.co.kr`(apex)로 보내는 리다이렉트 **제거**
3. (선택) apex도 Worker에 연결할 경우 Custom Domain `idosquare.co.kr` 추가 — 앱이 apex 요청을 **www로 리다이렉트**함
4. **Clerk** → Allowed origins / Redirect URLs에 `https://www.idosquare.co.kr` 포함

로컬에서 www 호스트 테스트: hosts에 `127.0.0.1 www.localhost` 추가, `NEXT_PUBLIC_WWW_URL=http://www.localhost:3000` 또는 `http://localhost:3000` + `/board`.

자세한 로드맵은 [`claude.md`](./claude.md)를 참고하세요.

## 라이선스

Private — Idosquare 프로젝트.
