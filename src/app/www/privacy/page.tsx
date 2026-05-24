import { PrivacyPolicyContent } from '@/components/www/PrivacyPolicyContent'
import { InfoFooter } from '@/components/www/InfoFooter'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description:
    'IdoSquare 개인정보 처리방침 (웹사이트 및 voicetales 등 서비스)입니다.',
}

export default function PrivacyPage() {
  return (
    <>
      <div
        className={cn(
          'mx-auto py-10 md:py-14',
          SITE_MAX_WIDTH_CLASS,
          SITE_HORIZONTAL_PADDING_CLASS,
        )}
      >
        <PrivacyPolicyContent />
      </div>
      <InfoFooter />
    </>
  )
}
