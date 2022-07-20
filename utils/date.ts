import format from 'date-fns/format'
import formatRelative from 'date-fns/formatRelative'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export const relativeTime = (baseTimeMin: string, resetTimeMin: string): string => {
  if (resetTimeMin === '0') {
    return 'One-time'
  }

  const baseTimeSeconds = +baseTimeMin * 60
  const resetTimeSeconds = +resetTimeMin * 60
  const nextResetTimeMilliseconds = (baseTimeSeconds + resetTimeSeconds) * 1000

  return formatRelative(nextResetTimeMilliseconds, Date.now())
}

export const getUTCStartOfDate = (timestamp: number): number => {
  const date = new Date(timestamp)

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
}

export const getLocalStartOfDate = (timestamp: number): number => {
  const date = new Date(timestamp)

  return date.setHours(0, 0, 0, 0)
}

export const formatWithSchema = (timestamp: number, schema: string): string => format(timestamp, schema)

export const formatTime = (timestamp: number): string => formatWithSchema(timestamp, 'h:mm a')

export const formatDateTime = (timestamp: number): string => formatWithSchema(timestamp, 'MMM d, yyyy - h:mm:ss a')

export const formatTimeInWords = (timestamp: number): string => formatDistanceToNow(timestamp, { addSuffix: true })
