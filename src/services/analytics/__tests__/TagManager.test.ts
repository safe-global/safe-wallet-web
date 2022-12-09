import Cookies from 'js-cookie'

import * as gtm from '../TagManager'

const { default: TagManager } = gtm

const MOCK_ID = 'GTM-123456'
const MOCK_AUTH = 'key123'
const MOCK_PREVIEW = 'env-0'

jest.mock('js-cookie', () => ({
  remove: jest.fn(),
}))

describe('TagManager', () => {
  const originalLocation = window.location

  // Mock `location.reload`
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        reload: jest.fn(),
      },
    })
  })

  // Remove mock
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  // Clear GTM between tests
  afterEach(() => {
    document.head.innerHTML = ''
    delete window.dataLayer
  })

  describe('TagManager._getScript', () => {
    it('should use the id, auth and preview', () => {
      const script1 = TagManager._getScript({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(script1.innerHTML).toContain(MOCK_ID)
      expect(script1.innerHTML).toContain(`&gtm_auth=${MOCK_AUTH}`)
      expect(script1.innerHTML).toContain(`&gtm_preview=${MOCK_PREVIEW}`)
      expect(script1.innerHTML).toContain('dataLayer')
    })
  })

  describe('TagManager.isInitialized', () => {
    it('should return false if no script is found', () => {
      expect(TagManager.isInitialized()).toBe(false)
    })

    it('should return true if a script is found', () => {
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(TagManager.isInitialized()).toBe(true)
    })
  })

  describe('TagManager.initialize', () => {
    it('should initialize TagManager', () => {
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(document.head.childNodes).toHaveLength(2)

      // Script added by `TagManager._getScript`
      // @ts-expect-error
      expect(document.head.childNodes[0].src).toBe(
        `https://www.googletagmanager.com/gtm.js?id=${MOCK_ID}&gtm_auth=${MOCK_AUTH}&gtm_preview=${MOCK_PREVIEW}&gtm_cookies_win=x`,
      )

      // Manually added script
      expect(document.head.childNodes[1]).toStrictEqual(
        TagManager._getScript({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW }),
      )

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
    })

    it('should not re-initialize the scripts if previously enabled', async () => {
      const getScriptSpy = jest.spyOn(gtm.default, '_getScript')

      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(getScriptSpy).toHaveBeenCalledTimes(1)
    })

    it('should push to the dataLayer if povided', () => {
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW, dataLayer: { test: '456' } })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[0]).toStrictEqual({ test: '456' })
      expect(window.dataLayer[1]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
    })
  })

  describe('TagManager.dataLayer', () => {
    it('should not push to the dataLayer if not initialized', () => {
      TagManager.dataLayer({ test: '456' })

      expect(window.dataLayer).toBeUndefined()
    })

    it('should push data to the dataLayer', () => {
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
    it('should not remove GA cookies and reload if not mounted', () => {
      TagManager.disable()

      expect(Cookies.remove).not.toHaveBeenCalled()

      expect(global.location.reload).not.toHaveBeenCalled()
    })
    it('should remove GA cookies and reload if mounted', () => {
      TagManager.initialize({
        gtmId: MOCK_ID,
        auth: MOCK_AUTH,
        preview: MOCK_PREVIEW,
      })

      TagManager.disable()

      const path = '/'
      const domain = '.localhost'

      expect(Cookies.remove).toHaveBeenCalledWith('_ga', { path, domain })
      expect(Cookies.remove).toHaveBeenCalledWith('_gat', { path, domain })
      expect(Cookies.remove).toHaveBeenCalledWith('_gid', { path, domain })

      expect(global.location.reload).toHaveBeenCalled()
    })
  })
})
