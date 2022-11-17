import * as formatters from '@/utils/formatters'

describe('formatters', () => {
  describe('removeTrailingZeros', () => {
    it('strips trailing 0s', () => {
      expect(formatters._removeTrailingZeros('0')).toBe('0')
      expect(formatters._removeTrailingZeros('0.000')).toBe('0')

      expect(formatters._removeTrailingZeros('10')).toBe('10')
      expect(formatters._removeTrailingZeros('100')).toBe('100')

      expect(formatters._removeTrailingZeros('0.100')).toBe('0.1')
      expect(formatters._removeTrailingZeros('0.010')).toBe('0.01')

      expect(formatters._removeTrailingZeros('1.101')).toBe('1.101')
      expect(formatters._removeTrailingZeros('1.100')).toBe('1.1')
      expect(formatters._removeTrailingZeros('1.100010')).toBe('1.10001')

      expect(formatters._removeTrailingZeros('100.11')).toBe('100.11')
      expect(formatters._removeTrailingZeros('100.10')).toBe('100.1')

      expect(
        formatters._removeTrailingZeros('1000000000000000000000000000000000000000000000000000000000000000001'),
      ).toBe('1000000000000000000000000000000000000000000000000000000000000000001')
      expect(
        formatters._removeTrailingZeros('1000000000000000000000000000000000000000000000000000000000000000001.100'),
      ).toBe('1000000000000000000000000000000000000000000000000000000000000000001.1')
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

    it('should return an empty string if passed a falsy value', () => {
      expect(formatters.shortenAddress('', 5)).toEqual('')

      // @ts-ignore - Invalid type
      expect(formatters.shortenAddress(undefined, 5)).toEqual('')

      // @ts-ignore - Invalid type
      expect(formatters.shortenAddress(null, 5)).toEqual('')
    })
  })
})
