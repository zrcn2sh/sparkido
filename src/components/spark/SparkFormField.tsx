'use client'

import { cn } from '@/lib/utils'
import type { SparkFormFieldGuide } from '@/lib/spark-form'
import {
  SparkFormFieldHeader,
  SparkFormGuide,
  SparkFormInputShell,
} from '@/components/spark/spark-form-ui'

type SparkFormFieldProps = {
  id: string
  label: string
  guide?: SparkFormFieldGuide
  required?: boolean
  maxLength?: number
  valueLength?: number
  children: React.ReactNode
  className?: string
}

export function SparkFormField({
  id,
  label,
  guide,
  required,
  maxLength,
  valueLength = 0,
  children,
  className,
}: SparkFormFieldProps) {
  const hasGuide = !!guide?.description?.trim()

  return (
    <fieldset className={cn('space-y-2.5 border-0 p-0', className)}>
      <legend className="sr-only">{label}</legend>

      <SparkFormFieldHeader
        htmlFor={id}
        label={label}
        required={required}
        maxLength={maxLength}
        valueLength={valueLength}
      />

      {hasGuide && guide && <SparkFormGuide label={label} guide={guide} />}

      <SparkFormInputShell>{children}</SparkFormInputShell>
    </fieldset>
  )
}
