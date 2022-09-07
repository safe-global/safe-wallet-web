import TagManager, { _getGtmDataLayerScript, _getGtmNoScript, _getGtmScript, _getRequiredGtmArgs } from '../TagManager'

const MOCK_ID = 'GTM-123456'

describe('TagManager', () => {
  beforeEach(() => {
    delete window.dataLayer
  })

  describe('getRequiredGtmArgs', () => {
    it('should assign default arguments', () => {
      const result1 = _getRequiredGtmArgs({ gtmId: MOCK_ID })

      expect(result1).toStrictEqual({
        gtmId: MOCK_ID,
        dataLayer: undefined,
        auth: '',
        preview: '',
      })

      const result2 = _getRequiredGtmArgs({ gtmId: MOCK_ID, auth: 'abcdefg', preview: 'env-1' })

      expect(result2).toStrictEqual({
        gtmId: MOCK_ID,
        dataLayer: undefined,
        auth: '&gtm_auth=abcdefg',
        preview: '&gtm_preview=env-1',
      })
    })
  })

  describe('getGtmScript', () => {
    it('should use the id', () => {
      const script1 = _getGtmScript({ gtmId: MOCK_ID })

      expect(script1.innerHTML).toContain(MOCK_ID)
      expect(script1.innerHTML).toContain('dataLayer')
    })

    it('should use the auth and preview if present', () => {
      const script1 = _getGtmScript({
        gtmId: MOCK_ID,
      })

      expect(script1.innerHTML).not.toContain('&gtm_auth')
      expect(script1.innerHTML).not.toContain('&gtm_preview')

      const script2 = _getGtmScript({
        gtmId: MOCK_ID,
        auth: 'abcdefg',
        preview: 'env-1',
      })

      expect(script2.innerHTML).toContain('&gtm_auth=abcdefg&gtm_preview=env-1')
    })
  })

  describe('getGtmNoScript', () => {
    it('should use the id for the iframe', () => {
      const noscript = _getGtmNoScript({ gtmId: MOCK_ID })

      expect(noscript.innerHTML).toContain(`id=GTM-123456`)
    })

    it('should use the gtm_auth and gtm_preview for the iframe if present', () => {
      const noscript1 = _getGtmNoScript({
        gtmId: MOCK_ID,
      })

      expect(noscript1.innerHTML).not.toContain('&gtm_auth')
      expect(noscript1.innerHTML).not.toContain('&gtm_preview')

      const noscript2 = _getGtmNoScript({
        gtmId: MOCK_ID,
        auth: 'abcdefg',
        preview: 'env-1',
      })

      expect(noscript2.innerHTML).toContain('&gtm_auth=abcdefg&gtm_preview=env-1')
    })
  })

  describe('getGtmDataLayerScript', () => {
    it('should use the `dataLayer` for the script', () => {
      const dataLayerScript = _getGtmDataLayerScript({
        gtmId: MOCK_ID,
        dataLayer: { foo: 'bar' },
      })

      expect(dataLayerScript.innerHTML).toContain('{"foo":"bar"}')
    })
  })

  describe('TagManager.initialize', () => {
    it('should initialize TagManager', () => {
      TagManager.initialize({ gtmId: MOCK_ID })

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toStrictEqual({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
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
