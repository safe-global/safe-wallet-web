import { BigNumber } from 'ethers'
import * as formatters from '@/utils/formatters'

describe('shortenAddress', () => {
  it('should shorten an address', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890')).toEqual('0x1234...7890')
  })

  it('should shorten an address with custom length', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890', 5)).toEqual('0x12345...67890')
  })
})

describe('formatDecimals', () => {
  it('should format decimals', () => {
    expect(formatters.formatDecimals('100000000000000000')).toEqual('0.1')
  })

  it('should format a big number with custom decimals', () => {
    expect(formatters.formatDecimals('99999910000000000000000', 6)).toEqual('99,999,910,000,000,000')
  })

  it('should format a fractional number with custom decimals', () => {
    expect(formatters.formatDecimals('12000001', 6)).toEqual('12.000001')
  })
})

describe('toDecimals', () => {
  it('should convert to decimals', () => {
    expect(formatters.toDecimals('2.01')).toEqual(BigNumber.from('2010000000000000000'))
  })

  it('should convert to decimals with custom decimals', () => {
    expect(formatters.toDecimals('3', 6)).toEqual(BigNumber.from('3000000'))
  })
})

describe('getNumberFormatterOptions', () => {
  it('should only return `maximumFractionDigits` of 5 when number is < 1_000', () => {
    expect(formatters._getNumberFormatterOptions(999.99)).toEqual({ maximumFractionDigits: 5 })
  })

  it('should only return `maximumFractionDigits` of 4 when number is < 10_000', () => {
    expect(formatters._getNumberFormatterOptions(9_999.99)).toEqual({ maximumFractionDigits: 4 })
  })

  it('should only return `maximumFractionDigits` of 3 when number is < 100_000', () => {
    expect(formatters._getNumberFormatterOptions(99_999.99)).toEqual({ maximumFractionDigits: 3 })
  })

  it('should only return `maximumFractionDigits` of 2 when number is < 1_000_000', () => {
    expect(formatters._getNumberFormatterOptions(999_999.99)).toEqual({ maximumFractionDigits: 2 })
  })

  it('should only return `maximumFractionDigits` of 1 when number is < 10_000_000', () => {
    expect(formatters._getNumberFormatterOptions(9_999_999.99)).toEqual({ maximumFractionDigits: 1 })
  })

  it('should only return `maximumFractionDigits` of 0 when number is < 100_000_000', () => {
    expect(formatters._getNumberFormatterOptions(99_999_999.99)).toEqual({ maximumFractionDigits: 0 })
  })

  it("should only return 'compact' `maximumFractionDigits` of 3 when number is < 10 ** 15", () => {
    expect(formatters._getNumberFormatterOptions(10 ** 14)).toEqual({ maximumFractionDigits: 3, notation: 'compact' })
  })

  it("should only return 'compact' for anything bigger", () => {
    expect(formatters._getNumberFormatterOptions(10 ** 15)).toEqual({ notation: 'compact' })
  })
})

describe('getCurrencyFormatterOptions', () => {
  it('should return standard notation below 100_000_000', () => {
    expect(formatters._getCurrencyFormatterOptions(99_999_999.99, 'USD')).toEqual({
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    })
  })
  it('should return compact notation above 100_000_000', () => {
    expect(formatters._getCurrencyFormatterOptions(100_000_000.99, 'USD')).toEqual({
      notation: 'compact',
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    })
  })
})

// TODO: Instantiating Intl.NumberFormat programmatically does not pass in tests.
describe.skip('formatAmount', () => {})

describe.skip('formatCurrency', () => {})
