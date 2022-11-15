import { normalizeAppName } from '../gtm'

describe('gtm', () => {
  describe('normalizeAppName', () => {
    it('should return the app name if is not an URL', () => {
      expect(normalizeAppName('Safe App')).toBe('Safe App')
    })

    it('should strip the querystring or hash when is an URL', () => {
      expect(normalizeAppName('http://domain.crypto')).toBe('http://domain.crypto')
      expect(normalizeAppName('http://domain.crypto?q1=query1&q2=query2')).toBe('http://domain.crypto')
      expect(normalizeAppName('http://domain.crypto#hash')).toBe('http://domain.crypto')
    })
  })
})
