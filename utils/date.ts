import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import formatRelative from 'date-fns/formatRelative'

export const relativeTime = (baseTimeMin: string, resetTimeMin: string): string => {
  if (resetTimeMin === '0') {
    return 'One-time'
  }

  const baseTimeSeconds = +baseTimeMin * 60
  const resetTimeSeconds = +resetTimeMin * 60
  const nextResetTimeMilliseconds = (baseTimeSeconds + resetTimeSeconds) * 1000

  return formatRelative(nextResetTimeMilliseconds, Date.now())
}

export const formatWithSchema = (timestamp: number, schema: string): string => format(timestamp, schema)

export const formatTime = (timestamp: number): string => formatWithSchema(timestamp, 'h:mm a')

export const formatDateTime = (timestamp: number): string => formatWithSchema(timestamp, 'MMM d, yyyy - h:mm:ss a')

export const formatTimeInWords = (timestamp: number): string => formatDistanceToNow(timestamp, { addSuffix: true })
