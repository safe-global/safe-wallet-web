import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export const formatWithSchema = (timestamp: number, schema: string): string => format(timestamp, schema)

export const formatTime = (timestamp: number): string => formatWithSchema(timestamp, 'h:mm a')

export const formatDateTime = (timestamp: number): string => formatWithSchema(timestamp, 'MMM d, yyyy - h:mm:ss a')

export const formatTimeInWords = (timestamp: number): string => formatDistanceToNow(timestamp, { addSuffix: true })
