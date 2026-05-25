# sparkido

**Idosquare** — 1인 개발자를 위한 아이디어(Spark) 등록과 실행 기록(Lab) 커뮤니티.

- **spark** · 메인 · Spark / Lab (`spark.idosquare.co.kr`, `www` 루트는 여기로 리다이렉트)
- **show** · Show (`show.idosquare.co.kr`)
- **info** · 회사 소개 (`info.idosquare.co.kr`)
- **link** · 앱 소개·스토어 링크 (`link.idosquare.co.kr`, idoweb-app 이전)
- **help** · 앱 도움말 (`help.idosquare.co.kr`, idoweb-app 이전)
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
| `NEXT_PUBLIC_WWW_URL` / `NEXT_PUBLIC_INFO_URL` / `NEXT_PUBLIC_LINK_URL` / `NEXT_PUBLIC_HELP_URL` / `NEXT_PUBLIC_BOARD_URL` / `NEXT_PUBLIC_ADMIN_URL` / `NEXT_PUBLIC_SPARK_URL` / `NEXT_PUBLIC_SHOW_URL` | 서브도메인 URL |
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

### board.idosquare.co.kr — DNS_PROBE_FINISHED_NXDOMAIN

코드 철자는 **`board.idosquare.co.kr`** 로 맞습니다. Chrome “오타” 안내는 **DNS에 `board` 호스트가 아예 없을 때** 나옵니다.

| 확인 | 조치 |
|------|------|
| `nslookup board.idosquare.co.kr` 실패 | Cloudflare **Workers → sparkido → Domains** 에 Custom Domain **`board.idosquare.co.kr`** 추가 |
| 기존 `www`용 CNAME만 있음 | `board`는 별도 Custom Domain (spark·show·info와 동일) |
| 추가 후 | 1~5분 뒤 `https://board.idosquare.co.kr` 재접속 |

`admin` / `show` / `info` 도 Custom Domain·Clerk allowlist에 각각 있어야 합니다.

### 간헐적 403 (미들웨어·세션)

- **info / show / board / link / help**: 공개 열람 — 커스텀 `sparkido_sess_anchor` 타임아웃 미적용 (`shouldEnforceCustomSessionTimeout`)
- **admin**: 로그인·관리자 필수 — 앵커 타임아웃 **적용**
- 만료 시 미들웨어에서 `revokeSession` 하지 않음 (Chrome 병렬 요청 race → Clerk 403 완화)
- 앵커 쿠키 `domain=.idosquare.co.kr` (프로덕션) — 서브도메인 간 동일 앵커
- Clerk `authorizedParties`에 요청 호스트 동적 포함

### Chrome만 403 · Edge는 정상일 때

연결(DNS·Worker)은 맞는데 **Chrome만** `403`이면, 설정 문제보다 **브라우저·Clerk 쿠키·캐시**인 경우가 많습니다.

| 확인 | 조치 |
|------|------|
| 예전에 403이 났던 적 있음 | Chrome → `idosquare.co.kr` **사이트 데이터·쿠키 삭제** (디스크 캐시에 403이 남을 수 있음) |
| 시크릿 창 | 확장 프로그램(광고 차단·프라이버시) 끄고 재시도 |
| Application → Cookies | `__client` / `_client_uat` 가 **`.idosquare.co.kr`과 `idosquare.co.kr` 두 도메인**에 중복이면 Chrome만 핸드셰이크 실패 → 전부 삭제 후 재로그인 |
| Network 탭 | **document** 403 vs **clerk.*** / **__clerk** 403 구분 (후자는 Dashboard allowlist) |
| 로그인 URL | Build variables에 `NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://spark.idosquare.co.kr/sign-in` (서브도메인마다 상대 `/sign-in` 지양) |

Edge는 서드파티 쿠키·캐시 정책이 덜 엄격해 같은 서버에서도 Chrome만 깨지는 일이 흔합니다. 최신 코드 배포 후에도 document 403이면 위 쿠키 정리를 먼저 해보세요.

### show / info 등에서 403 (Clerk)

`GET https://show.idosquare.co.kr/ … 403` 이 **문서(메인) 요청**에서 나오면, 대부분 **Clerk 미들웨어가 해당 호스트를 허용 오리진으로 인식하지 못할 때** 발생합니다. (서버만 `curl`로 보면 200인데 브라우저만 403인 경우가 많습니다.)

**코드(이 저장소)** — 배포 후 반영됨:

- 미들웨어에서 **`authorizedParties` 제거** (서브도메인 document 403 방지)
- Clerk 핸드셰이크 **`/__clerk/*`** matcher 유지
- `ClerkProvider`의 **`allowedRedirectOrigins`** 는 `NEXT_PUBLIC_*_URL` 기반 유지

**Clerk Dashboard (프로덕션 `pk_live_…` 앱)**

1. **Configure → Domains** — Production root: `idosquare.co.kr`
2. **Allowed Subdomains** ([문서](https://clerk.com/docs/guides/dashboard/dns-domains/subdomain-allowlist))
   - 켜져 있으면 **전부** 등록: `www`, `spark`, `show`, `info`, `board`, `admin` + `.idosquare.co.kr`
   - 빠른 확인: **Enable allowed subdomains 끄기** → 403이 사라지면 allowlist 누락이 원인
3. **Redirect URLs** — `https://show.idosquare.co.kr/*` 등 각 호스트 `/*` 추가
4. **Cloudflare Workers Builds (Build variables)** — 아래 URL이 **빌드 시** 들어가야 함 (Secret만으로는 클라이언트에 안 박힘):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SHOW_URL=https://show.idosquare.co.kr`
   - `NEXT_PUBLIC_INFO_URL`, `NEXT_PUBLIC_BOARD_URL`, `NEXT_PUBLIC_ADMIN_URL` 등
   - 변경 후 **Build부터 재배포**

**브라우저에서 확인**

- Network → `show.idosquare.co.kr` **문서** 요청 Status
- 같은 탭에서 `clerk` / `frontend-api` / `__clerk` 요청이 403인지 구분

앱은 Show·Info를 **비로그인 열람** 가능하게 두었습니다. 문서가 403이면 Clerk·재배포를, Clerk API만 403이면 Dashboard allowlist를 우선 보세요.

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
