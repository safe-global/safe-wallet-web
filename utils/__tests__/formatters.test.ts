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
