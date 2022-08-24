import * as formatters from '@/utils/formatters'

describe('formatters', () => {
  describe('safeFormatUnits', () => {
    // FIXME: Remove when temporary fix is removed from `safeFormatUnits`
    it('strips trailing 0s', () => {
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
