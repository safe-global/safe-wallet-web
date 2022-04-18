import { Errors, logError, trackError, CodedException } from '.'
import * as constants from '@/config/constants'
import * as Sentry from '@sentry/react'

describe('CodedException', () => {
  beforeAll(() => {
    jest.mock('@sentry/react')
    jest.mock('@/config/constants', () => ({
      IS_PRODUCTION: false,
    }))
    console.error = jest.fn()
    // @ts-ignore
    Sentry.captureException = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    ;(constants as any).IS_PRODUCTION = false
  })

  it('throws an error if code is not found', () => {
    expect(Errors.___0).toBe('0: No such error code')

    expect(() => {
      new CodedException('weird error' as any)
    }).toThrow('Code 0: No such error code (weird error)')
  })

  it('creates an error', () => {
    const err = new CodedException(Errors._100)
    expect(err.message).toBe('Code 100: Invalid input in the address field')
    expect(err.code).toBe(100)
    expect(err.content).toBe(Errors._100)
  })

  it('creates an error with an extra message', () => {
    const err = new CodedException(Errors._100, '0x123')
    expect(err.message).toBe('Code 100: Invalid input in the address field (0x123)')
    expect(err.code).toBe(100)
    expect(err.content).toBe(Errors._100)
  })

  it('creates an error with an extra message and a context', () => {
    const context = {
      tags: {
        error_category: 'Safe Apps',
      },
      contexts: {
        safeApp: {
          name: 'Zorbed.Finance',
          url: 'https://zorbed.finance',
        },
        message: {
          method: 'getSafeBalance',
          params: {
            address: '0x000000',
          },
        },
      },
    }

    const err = new CodedException(Errors._901, 'getSafeBalance: Server responded with 429 Too Many Requests', context)
    expect(err.message).toBe(
      'Code 901: Error processing Safe Apps SDK request (getSafeBalance: Server responded with 429 Too Many Requests)',
    )
    expect(err.code).toBe(901)
    expect(err.context).toEqual(context)
  })

  describe('Logging', () => {
    it('logs to the console', () => {
      const err = logError(Errors._100, '123')
      expect(err.message).toBe('Code 100: Invalid input in the address field (123)')
      expect(console.error).toHaveBeenCalledWith(err)
    })

    it('logs to the console via the public log method', () => {
      const err = new CodedException(Errors._601)
      expect(err.message).toBe('Code 601: Error fetching balances')
      expect(console.error).not.toHaveBeenCalled()
      err.log()
      expect(console.error).toHaveBeenCalledWith(err)
    })

    it('logs only the error message on prod', () => {
      ;(constants as any).IS_PRODUCTION = true
      logError(Errors._100)
      expect(console.error).toHaveBeenCalledWith('Code 100: Invalid input in the address field')
    })
  })

  describe('Tracking', () => {
    it('tracks using Sentry on production', () => {
      ;(constants as any).IS_PRODUCTION = true
      const err = trackError(Errors._100)
      expect(Sentry.captureException).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(err.message)
    })

    it('does not track using Sentry in non-production envs', () => {
      const err = trackError(Errors._100)
      expect(Sentry.captureException).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(err)
    })
  })
})
