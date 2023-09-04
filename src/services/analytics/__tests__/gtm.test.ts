import { normalizeAppName } from '../gtm'

const FAKE_SAFE_APP_NAME = 'Safe App'
const FAKE_DOMAIN = 'http://domain.crypto'

describe('gtm', () => {
  describe('normalizeAppName', () => {
    it('should return the app name if is not an URL', () => {
      expect(normalizeAppName(FAKE_SAFE_APP_NAME)).toBe(FAKE_SAFE_APP_NAME)
    })

    it('should strip the querystring or hash when is an URL', () => {
      expect(normalizeAppName(FAKE_DOMAIN)).toBe(FAKE_DOMAIN)
      expect(normalizeAppName(`${FAKE_DOMAIN}?q1=query1&q2=query2`)).toBe(FAKE_DOMAIN)
      expect(normalizeAppName(`${FAKE_DOMAIN}#hash`)).toBe(FAKE_DOMAIN)
    })
  })
})
