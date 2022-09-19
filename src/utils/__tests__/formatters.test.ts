import * as formatters from '@/utils/formatters'

describe('formatters', () => {
  describe('removeTrailingZeros', () => {
    it('strips trailing 0s', () => {
      const result1 = formatters._removeTrailingZeros('1.000000000000000000')
      expect(result1).toBe('1')

      const result2 = formatters._removeTrailingZeros('1.00001000000')
      expect(result2).toBe('1.00001')

      const result3 = formatters._removeTrailingZeros('1')
      expect(result3).toBe('1')
    })
  })
  describe('safeFormatUnits', () => {
    it('formats to gwei by default', () => {
      const result1 = formatters.safeFormatUnits('1')
      expect(result1).toBe('0.000000001')

      const result2 = formatters.safeFormatUnits('100000000')
      expect(result2).toBe('0.1')
    })
  })

  describe('shortenAddress', () => {
    it('should shorten an address', () => {
      expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890')).toEqual('0x1234...7890')
    })

    it('should shorten an address with custom length', () => {
      expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890', 5)).toEqual('0x12345...67890')
    })
  })
})
