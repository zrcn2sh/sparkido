/** link.idosquare.co.kr · help.idosquare.co.kr 공통 앱 메타 (idoweb-app 이전) */

export type StoreLink =
  | { kind: 'url'; href: string; label: string }
  | { kind: 'pending'; label: string }

export type IdoWebApp = {
  slug: string
  name: string
  descriptionKo: string
  descriptionEn: string
  iconUrl: string
  appStoreUrl?: string
  playStoreUrl?: string
  playStorePending?: boolean
  helpSlug: string
}

/** sparkido public/ — idoweb 외부 호스트 의존 제거 */
export const APP_STORE_BADGE_URL = '/link-icons/app-store-badge.svg'
export const GOOGLE_PLAY_BADGE_URL = '/link-icons/google-play-badge.png'

export const IDOWEB_APPS: IdoWebApp[] = [
  {
    slug: 'voicetales',
    name: 'VoiceTales',
    descriptionKo: 'AI가 들려주는 동화',
    descriptionEn: 'Stories told by AI',
    iconUrl: '/app-icons/voicetales.webp',
    appStoreUrl: 'https://apps.apple.com/us/app/voicetales/id6758271399',
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.idosquare.voicetale',
    helpSlug: 'voicetales',
  },
  {
    slug: 'feelog-diary',
    name: 'Feelog Diary',
    descriptionKo: '감정과 일상을 기록하는 다이어리',
    descriptionEn: 'A diary for your feelings and daily life',
    iconUrl: '/app-icons/feelog-diary.webp',
    appStoreUrl: 'https://apps.apple.com/us/app/feelog-diary/id6759537600',
    playStorePending: true,
    helpSlug: 'feelog-diary',
  },
  {
    slug: 'dancingwhales',
    name: 'DancingWhales',
    descriptionKo:
      '아이와 함께 만드는 칭찬스티커 앱. 부모가 미션을 주고, 아이가 미션을 해결하며 보상을 받습니다.',
    descriptionEn:
      'A praise-sticker app for parents and kids. Parents set missions; kids complete them and earn rewards.',
    iconUrl: '/app-icons/dancingwhales.webp',
    appStoreUrl: 'https://apps.apple.com/kr/app/dancingwhales/id6761303478',
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.idosquare.dancingwhales',
    helpSlug: 'dancingwhales',
  },
  {
    slug: 'pillscan',
    name: 'PillScan',
    descriptionKo: 'AI 복약도우미',
    descriptionEn: 'AI-powered medication reminders and pill tracking',
    iconUrl: '/app-icons/pillscan.webp',
    appStoreUrl:
      'https://apps.apple.com/us/app/pillscan/id6768040341?l=ko',
    helpSlug: 'pillscan',
  },
]

export const HELP_SLUGS = IDOWEB_APPS.map((a) => a.helpSlug)

export function getIdoWebAppByHelpSlug(slug: string): IdoWebApp | undefined {
  return IDOWEB_APPS.find((a) => a.helpSlug === slug)
}
