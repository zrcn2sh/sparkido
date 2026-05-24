export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonUnauthorized } from '@/lib/api'
import type { ShowGridPlacement } from '@/lib/show-selection'
import { createShowTilePlacements, listShowPages } from '@/lib/show-tiles'
import { SHOW_CATEGORY_ORDER, showCategoryToKind } from '@/lib/show-labels'
import type { ShowTileCategory } from '@/types/show'

function isShowTileCategory(v: unknown): v is ShowTileCategory {
  return (
    typeof v === 'string' &&
    SHOW_CATEGORY_ORDER.includes(v as ShowTileCategory)
  )
}

function parsePlacement(raw: unknown): ShowGridPlacement | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const pageIndex = Number(o.pageIndex)
  const col = Number(o.col)
  const row = Number(o.row)
  const width = Number(o.width)
  const height = Number(o.height)
  if (
    !Number.isInteger(pageIndex) ||
    !Number.isInteger(col) ||
    !Number.isInteger(row) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height)
  ) {
    return null
  }
  return { pageIndex, col, row, width, height }
}

export async function GET() {
  try {
    const { userId } = await auth()
    const pages = await listShowPages(userId)
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('[GET /api/show/pages]', error)
    return NextResponse.json(
      { error: 'Show 목록을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const body = (await request.json()) as Record<string, unknown>

    if (!isShowTileCategory(body.category)) {
      return jsonError('구분을 선택해 주세요.')
    }

    const category = body.category
    const kind = showCategoryToKind(category)

    let placements: ShowGridPlacement[] = []

    if (Array.isArray(body.placements)) {
      placements = body.placements
        .map(parsePlacement)
        .filter((p): p is ShowGridPlacement => p !== null)
    } else {
      const single = parsePlacement(body)
      if (single) placements = [single]
    }

    if (placements.length === 0) {
      return jsonError('그리드 위치가 올바르지 않습니다.')
    }

    const tile = await createShowTilePlacements(
      placements,
      {
        title: String(body.title ?? ''),
        tagline: String(body.tagline ?? ''),
        kind,
        category,
        imageUrl:
          typeof body.imageUrl === 'string' ? body.imageUrl : undefined,
        iconText:
          typeof body.iconText === 'string' ? body.iconText : undefined,
        linkUrl: typeof body.linkUrl === 'string' ? body.linkUrl : undefined,
      },
      userId,
    )

    return NextResponse.json({ tile }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/show/pages]', error)
    const message =
      error instanceof Error ? error.message : '타일 등록에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
