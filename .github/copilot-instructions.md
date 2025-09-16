## 빠른 개요

이 저장소는 PostgreSQL을 사용하는 TypeScript(CommonJS) 기반의 Express API입니다. 주요 진입점:

- `src/index.ts` — 앱 부트스트랩, `process.env.DATABASE_URL`로 `pg` Pool 생성, `src/loadRoutes.ts`로 라우트 로드, 기본 포트 3001에서 서버 시작.
- `src/loadRoutes.ts` — `src/routes`의 모든 파일을 동적으로 import 하여 `/api/<routeName>`로 마운트합니다 (예: `src/routes/users.ts` -> `/api/users`).

## 아키텍처 & 패턴

- 라우팅: `src/routes/*.ts`의 각 파일은 Express `Router`를 export 합니다. 라우트는 보통 `src/controllers/*`의 컨트롤러 함수를 호출합니다.
- 컨트롤러: `src/db/index.ts`가 export 하는 `pool`을 사용하며, 멀티스테이트먼트 작업은 `client = await pool.connect()` 후 명시적 트랜잭션(`BEGIN`/`COMMIT`/`ROLLBACK`)으로 처리합니다(`src/controllers/users.ts` 참조).
- DB 쿼리: `pg`로 raw SQL 사용. 쿼리 빌더 헬퍼는 `src/utils/query/*`에 있음(예: `buildGetQuery`, `buildUpdateQuery`). DB 행은 snake_case이며 응답은 `src/utils/transform/toCamel.ts`로 camelCase 변환 후 반환됩니다.
- 인증: JWT 기반. 토큰 생성/검증은 `src/utils/auth/jwt.ts`에서 수행되며 `process.env.PRIVATE_PASSWORD`를 사용합니다. `src/middleware/authMiddleware.ts`가 토큰을 검증하고 `req.user`를 주입합니다.
- 파일 저장소: 앱 시작 시 `FILESTORAGE_PATH`(환경변수)가 존재하는지 확인하고 없으면 생성합니다 (`src/index.ts`).

## 에이전트가 지켜야 할 규칙

- 동적 라우트 마운팅을 따르세요: 새로운 라우트를 추가하려면 `src/routes/`에 파일을 만들고 Express `Router`를 export 합니다(기본 내보내기 또는 이름 내보내기 모두 가능). 라우트 경로는 `/api/<파일명>`이 됩니다.
- DB 작업은 `client = await pool.connect()`를 사용하고, 여러 쿼리를 수행하는 경우 트랜잭션을 명시적으로 사용하세요.
- DB 컬럼은 snake_case로 유지하세요. 클라이언트 응답은 `snakeToCamelObject`로 변환해 camelCase로 반환합니다(`src/controllers/*` 패턴 참조).
- 오류 처리: 컨트롤러는 `throw`하거나 `next(err)`를 사용합니다. `src/index.ts`의 전역 에러 핸들러는 `{ error: message }` 형태로 응답하고 `err.status`를 사용합니다.
- 인증 관련: 항상 `authMiddleware`가 `req.user`를 주입한다고 가정하세요. 토큰 구조는 `verifyAccessToken`에서 검증하는 `{ sessionId, user }`입니다.

## 빌드 / 개발 / 배포 워크플로

- 로컬 빌드+실행: `npm run dev` (TypeScript 컴파일 후 `dist/index.js` 실행).
- 설치 후 시작: `npm run start` (`npm i` 실행, 컴파일, `dist/index.js` 실행).
- DB 마이그레이션: `node-pg-migrate` 사용. `package.json`에 `migrate:create`, `migrate:up`, `migrate:down` 스크립트가 정의되어 있습니다. 마이그레이션 파일은 `src/db/migrations`에 위치합니다.
- CI/배포: `.github/workflows/deploy.yml`이 `main` 브랜치 푸시를 트리거하여 SSH로 서버에 접속해 코드를 pull 하고 서비스 재시작합니다.

## 변경/수정 작업 시 참고할 파일들

- 라우트 추가: `src/routes/*.ts`
- 핸들러 구현: `src/controllers/*` (특히 `users.ts`의 패턴을 따르세요)
- 쿼리 헬퍼: `src/utils/query/*`
- 인증 헬퍼 및 미들웨어: `src/utils/auth/*`, `src/middleware`
- DB 풀: `src/db/index.ts`

## 예제 (복사해서 사용 가능한 패턴)

- 라우터 추가 예: `src/routes/thing.ts`에 Express Router를 export 하면 `/api/thing`으로 제공됩니다.
- 트랜잭션 패턴(`users.ts`에서 발췌):
  1. `const client = await pool.connect()`
  2. `await client.query('BEGIN')`
  3. `client.query(...)`로 쿼리 실행
  4. 성공 시 `await client.query('COMMIT')`, 오류 시 `ROLLBACK`, 그리고 `client.release()`를 finally에서 호출

## 주의할 점

- `PRIVATE_PASSWORD`와 `DATABASE_URL` 환경변수는 필수입니다. 로컬 실행/테스트 시 반드시 설정하세요.
- `loadRoutes`는 동적 import를 사용합니다. 컴파일된 `dist` 폴더가 런타임에서 동일한 구조를 유지해야 합니다.

## 환경변수 예시

다음은 현재 프로젝트 루트의 `.env`에 들어있는 주요 환경변수 예시입니다. 값은 민감 정보이므로 저장소에 비공개로 유지하세요.

- `DATABASE_URL` — PostgreSQL 연결 문자열 (예: postgres://user:pass@host:5432/dbname)
- `PRIVATE_PASSWORD` — JWT 서명용 비밀키
- `PRIVATE_REFRESH_PASSWORD` — 리프레시 토큰 서명용 비밀키(프로젝트에서 사용 시)
- `PORT` — 앱이 수신 대기할 포트 (기본 3001)
- `FILESTORAGE_PATH` — 파일 업로드/저장 디렉터리 경로
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI` — 카카오 OAuth 연동에 사용되는 값

권장: `.env.sample` 파일을 생성해 위 키들의 이름과 설명만 제공하고 실제 값은 로컬/CI에서 설정하도록 하세요.

추가로 특정 폴더의 예제가 더 필요하면 알려주세요. 문서를 빠르게 보완해 드립니다.
