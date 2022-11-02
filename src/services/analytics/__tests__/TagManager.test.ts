import TagManager, { _getGtmScript } from '../TagManager'

const MOCK_ID = 'GTM-123456'
const MOCK_AUTH = 'key123'
const MOCK_PREVIEW = 'env-0'

describe('TagManager', () => {
  beforeEach(() => {
    delete window.dataLayer
  })

  describe('getGtmScript', () => {
    it('should use the id, auth and preview', () => {
      const script1 = _getGtmScript({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(script1.innerHTML).toContain(MOCK_ID)
      expect(script1.innerHTML).not.toContain(`&gtm_auth=${MOCK_AUTH}`)
      expect(script1.innerHTML).not.toContain(`&gtm_auth=${MOCK_PREVIEW}`)
      expect(script1.innerHTML).toContain('dataLayer')
    })
  })

  describe('TagManager.initialize', () => {
    it('should initialize TagManager', () => {
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW })

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
    })

    it('should push to the dataLayer if povided', () => {
      TagManager.initialize({ gtmId: MOCK_ID, auth: MOCK_AUTH, preview: MOCK_PREVIEW, dataLayer: { test: '456' } })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[0]).toStrictEqual({ test: '456' })
      expect(window.dataLayer[1]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
    })
  })

  describe('TagManager.dataLayer', () => {
    it('should push data to the dataLayer', () => {
      TagManager.dataLayer({
        test: '123',
      })

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({
        test: '123',
      })
    })
  })
})
