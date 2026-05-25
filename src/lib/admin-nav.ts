/** admin 서브도메인에서는 /admin 접두어 없이 사용 */
export const ADMIN_NAV_ITEMS = [
  { path: '/members', label: '회원관리' },
  { path: '/fuel', label: 'Fuel 이력' },
  { path: '/show', label: 'Show 관리' },
  { path: '/show/history', label: 'Show 이력' },
  { path: '/settings', label: '기본설정' },
] as const
