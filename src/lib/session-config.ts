/**
 * 로그인 세션 최대 유지 시간(시간). 기본 3시간.
 * 미들웨어는 쿠키(sparkido_sess_anchor)에 로그인 시각을 고정해 강제합니다.
 * (Clerk JWT의 iat는 토큰 갱신 시마다 바뀌어 3시간 만료에 쓸 수 없음)
 */
export const SESSION_MAX_AGE_HOURS = Number(
  process.env.CLERK_SESSION_MAX_AGE_HOURS ?? 3,
)

export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_HOURS * 60 * 60

export const SESSION_EXPIRED_SIGN_IN_REASON = 'session_expired'

export const SESSION_EXPIRED_MESSAGE =
  '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.'
