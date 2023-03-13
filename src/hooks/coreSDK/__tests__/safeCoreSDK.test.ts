import { isValidSafeVersion } from '../safeCoreSDK'

describe('safeCoreSDK', () => {
  describe('isValidSafeVersion', () => {
    it('should return true for valid versions', () => {
      expect(isValidSafeVersion('1.3.0')).toBe(true)

      expect(isValidSafeVersion('1.2.0')).toBe(true)

      expect(isValidSafeVersion('1.1.1')).toBe(true)

      expect(isValidSafeVersion('1.3.0+L2')).toBe(true)
    })
    it('should return false for invalid versions', () => {
      expect(isValidSafeVersion('1.3.1')).toBe(false)

      expect(isValidSafeVersion('1.4.0')).toBe(false)

      expect(isValidSafeVersion('1.0.0')).toBe(true)

      expect(isValidSafeVersion('0.0.1')).toBe(false)

      expect(isValidSafeVersion('')).toBe(false)

      expect(isValidSafeVersion()).toBe(false)
    })
  })
})
