import * as Sentry from '@sentry/react'
import type { CaptureContext } from '@sentry/types'
import { IS_PRODUCTION } from '@/config/constants'
import ErrorCodes from './ErrorCodes'

export class CodedException extends Error {
  public readonly code: number
  public readonly content: string
  // the context allows to enrich events, for the list of allowed context keys/data, please check the type or go to
  // https://docs.sentry.io/platforms/javascript/enriching-events/context/
  // The context is not searchable, that means its goal is just to provide additional data for the error
  public readonly context?: CaptureContext

  private getCode(content: ErrorCodes): number {
    const codePrefix = content.split(':')[0]
    const code = Number(codePrefix)
    if (isNaN(code)) {
      throw new CodedException(ErrorCodes.___0, codePrefix)
    }
    return code
  }

  constructor(content: ErrorCodes, extraMessage?: string, context?: CaptureContext) {
    super()

    const extraInfo = extraMessage ? ` (${extraMessage})` : ''
    this.message = `Code ${content}${extraInfo}`
    this.code = this.getCode(content)
    this.content = content
    this.context = context
  }

  public log(): void {
    // Filter out the logError fn from the stack trace
    if (this.stack) {
      const newStack = this.stack
        .split('\n')
        .filter((line) => !line.includes(logError.name))
        .join('\n')
      try {
        this.stack = newStack
      } catch (e) {}
    }

    // Log only the message on prod, and the full error on dev
    console.error(IS_PRODUCTION ? this.message : this)
  }

  public track(): void {
    this.log()

    if (IS_PRODUCTION) {
      Sentry.captureException(this, this.context)
    }
  }
}

type ErrorHandler = (content: ErrorCodes, extraMessage?: string, context?: CaptureContext) => CodedException

export const logError: ErrorHandler = function logError(...args) {
  const error = new CodedException(...args)
  error.log()
  return error
}

export const trackError: ErrorHandler = function trackError(...args) {
  const error = new CodedException(...args)
  error.track()
  return error
}

export const Errors = ErrorCodes
