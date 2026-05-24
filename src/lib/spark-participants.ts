import type { LabLog, Spark } from '@/types'

export const PARTICIPANT_COLORS = {
  author: '#1D9E75',
  participant1: '#378ADD',
  participant2: '#EF9F27',
  other: '#888780',
} as const

export type SparkParticipant = {
  userId: string
  displayName: string
  role: 'author' | 'participant'
  labCount: number
  color: string
}

export function buildSparkParticipants(
  spark: Spark,
  logs: LabLog[],
  doerNames: Record<string, string>,
): SparkParticipant[] {
  const counts = new Map<string, number>()
  for (const log of logs) {
    counts.set(log.doerId, (counts.get(log.doerId) ?? 0) + 1)
  }

  const participantIds = [...counts.keys()].filter(
    (id) => id !== spark.authorId,
  )

  const list: SparkParticipant[] = [
    {
      userId: spark.authorId,
      displayName: doerNames[spark.authorId] ?? '작성자',
      role: 'author',
      labCount: counts.get(spark.authorId) ?? 0,
      color: PARTICIPANT_COLORS.author,
    },
  ]

  participantIds.forEach((userId, index) => {
    list.push({
      userId,
      displayName: doerNames[userId] ?? '참여자',
      role: 'participant',
      labCount: counts.get(userId) ?? 0,
      color:
        index === 0
          ? PARTICIPANT_COLORS.participant1
          : index === 1
            ? PARTICIPANT_COLORS.participant2
            : PARTICIPANT_COLORS.other,
    })
  })

  return list
}

export function filterLabLogsByDoer(
  logs: LabLog[],
  doerId: string | null,
): LabLog[] {
  if (!doerId) return logs
  return logs.filter((log) => log.doerId === doerId)
}
