import { cn } from '@/lib/utils'

type AppIconImageProps = {
  src: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'size-10 rounded-[10px]',
  md: 'size-12 rounded-xl',
  lg: 'size-14 rounded-xl',
} as const

/** help·link — public 또는 외부 아이콘 (next/image remote 제한 회피) */
export function AppIconImage({
  src,
  alt = '',
  size = 'sm',
  className,
}: AppIconImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size === 'lg' ? 56 : size === 'md' ? 48 : 40}
      height={size === 'lg' ? 56 : size === 'md' ? 48 : 40}
      className={cn('shrink-0 object-cover bg-white/[0.08]', sizeClass[size], className)}
      loading="lazy"
      decoding="async"
    />
  )
}
