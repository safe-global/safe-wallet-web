import Cookies from 'js-cookie'

import * as constants from '@/config/constants'

const MOCK_ID = 'GTM-123456'
const MOCK_AUTH = 'key123'
const MOCK_PREVIEW = 'env-0'

const MOCK_MEASUREMENT_ID = 'UA-123456-1'

jest.mock('js-cookie', () => ({
  remove: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
}))

jest.mock('@/config/constants', () => ({
  get GOOGLE_ANALYTICS_MEASUREMENT_ID() {
    return MOCK_MEASUREMENT_ID
  },
}))

describe('TagManager', () => {
  beforeEach(() => {
    jest.resetModules()

    // @ts-expect-error
    delete window[`ga-disable-${constants.GOOGLE_ANALYTICS_MEASUREMENT_ID}`]
    delete window['dataLayer']
  })

  describe('getGtmScript', () => {
    it('should use the id, auth and preview', () => {
      const { _getGtmScript } = require('../TagManager')
      const script1 = _getGtmScript({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(script1.innerHTML).toContain(MOCK_ID)
      expect(script1.innerHTML).toContain(`&gtm_auth=${MOCK_AUTH}`)
      expect(script1.innerHTML).toContain(`&gtm_preview=${MOCK_PREVIEW}`)
      expect(script1.innerHTML).toContain('dataLayer')
    })
  })

  describe('TagManager.isEnabled', () => {
    it('returns true if the cookie is not set and the GA_DISABLE_KEY is false', () => {
      const { TagManager } = require('../TagManager')
      ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = false

      expect(TagManager.isEnabled()).toBe(true)
    })

    it('returns false if the cookie is set and the GA_DISABLE_KEY is false', () => {
      const { TagManager } = require('../TagManager')
      ;(Cookies.get as jest.Mock).mockReturnValue('true')
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = false

      expect(TagManager.isEnabled()).toBe(false)
    })

    it('returns false if the cookie is not set and the GA_DISABLE_KEY is true', () => {
      const { TagManager } = require('../TagManager')
      ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = true

      expect(TagManager.isEnabled()).toBe(false)
    })
  })

  describe('TagManager.isMounted', () => {
    it('returns true if the GA_DISABLE_KEY is in window and the gtmScriptRef is set', () => {
      const { TagManager } = require('../TagManager')
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = true

      expect(TagManager.isMounted()).toBe(true)
    })

    it('returns false if the GA_DISABLE_KEY is not in window and the gtmScriptRef is set', () => {
      const { TagManager } = require('../TagManager')
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = false

      expect(TagManager.isMounted()).toBe(false)
    })

    it('returns false if the GA_DISABLE_KEY is in window and the gtmScriptRef is not set', () => {
      const { TagManager } = require('../TagManager')
      // @ts-expect-error
      window[constants.GA_DISABLE_KEY] = true

      expect(TagManager.isMounted()).toBe(false)
    })
  })

  describe('TagManager.initialize', () => {
    it('should not initialize TagManager if already initialized', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(document.head.childNodes).toHaveLength(2)
    })

    it('should initialize TagManager', () => {
      const { default: TagManager, _getGtmScript } = require('../TagManager')

      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(document.head.childNodes).toHaveLength(2)

      // Script added by `_getGtmScript`
      // @ts-expect-error
      expect(document.head.childNodes[0].src).toBe(
        `https://www.googletagmanager.com/gtm.js?id=${MOCK_ID}&gtm_auth=${MOCK_AUTH}&gtm_preview=${MOCK_PREVIEW}&gtm_cookies_win=x`,
      )

      // Manually added script
      expect(document.head.childNodes[1]).toStrictEqual(
        _getGtmScript({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW }),
      )

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })

      // @ts-expect-error
      expect(window[`ga-disable-${constants.GOOGLE_ANALYTICS_MEASUREMENT_ID}`]).toBe(false)

      expect(Cookies.remove).toHaveBeenCalledWith('google-analytics-opt-out', { path: '/' })
    })

    it('should push to the dataLayer if povided', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW, dataLayer: { test: '456' } })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[0]).toStrictEqual({ test: '456' })
      expect(window.dataLayer[1]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
    })
  })

  describe('TagManager.dataLayer', () => {
    it('should not push to the dataLayer if not initialized', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.dataLayer({ test: '456' })

      expect(window.dataLayer).toBeUndefined()
    })

    it('should push data to the dataLayer', () => {
      const { default: TagManager } = require('../TagManager')

      expect(window.dataLayer).toBeUndefined()

      TagManager.initialize({
        gtmId: MOCK_ID,
        auth: MOCK_AUTH,
        preview: MOCK_PREVIEW,
      })

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })

      TagManager.dataLayer({
        test: '123',
      })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[1]).toStrictEqual({ test: '123' })
    })
  })

  describe('TagManager.disable', () => {
    it('should not remove GA cookies if mounted', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.initialize({
        gtmId: MOCK_ID,
        auth: MOCK_AUTH,
        preview: MOCK_PREVIEW,
      })

      TagManager.disable()

      const path = '/'
      const domain = '.localhost'

      expect(Cookies.remove).not.toHaveBeenCalled()
    })
    it('should remove GA cookies if not mounted', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.disable()

      const path = '/'
      const domain = '.localhost'

      expect(Cookies.remove).toHaveBeenCalledWith('_ga', { path, domain })
      expect(Cookies.remove).toHaveBeenCalledWith('_gat', { path, domain })
      expect(Cookies.remove).toHaveBeenCalledWith('_gid', { path, domain })
    })

    it('should not disable TagManager if not initialized', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.disable()

      // @ts-expect-error
      expect(window[`ga-disable-${constants.GOOGLE_ANALYTICS_MEASUREMENT_ID}`]).toBeUndefined()

      expect(Cookies.set).not.toHaveBeenCalled()
    })

    it('should disable GA', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.initialize({
        gtmId: MOCK_ID,
        auth: MOCK_AUTH,
        preview: MOCK_PREVIEW,
      })

      TagManager.disable()

      // @ts-expect-error
      expect(window[`ga-disable-${constants.GOOGLE_ANALYTICS_MEASUREMENT_ID}`]).toBe(true)
    })

    it('should disable GTM triggers', () => {
      const { default: TagManager } = require('../TagManager')

      TagManager.initialize({
        gtmId: MOCK_ID,
        auth: MOCK_AUTH,
        preview: MOCK_PREVIEW,
      })

      TagManager.disable()

      expect(Cookies.set).toHaveBeenCalledWith('google-analytics-opt-out', 'true', {
        expires: Number.MAX_SAFE_INTEGER,
        path: '/',
      })
    })
  })
})
