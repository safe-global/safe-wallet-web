import * as formatters from '@/utils/formatters'
import { BigNumber } from 'ethers'

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
    expect(formatters.formatDecimals('99999910000000000000000', 6)).toEqual('> 999T')
  })

  it('should format a fractional number with custom decimals', () => {
    expect(formatters.formatDecimals('120007', 6)).toEqual('0.12001')
  })
})

describe('toWei', () => {
  it('should convert to wei', () => {
    expect(formatters.toWei('2.01')).toEqual(BigNumber.from('2010000000000000000'))
  })

  it('should convert to wei with custom decimals', () => {
    expect(formatters.toWei('3', 6)).toEqual(BigNumber.from('3000000'))
  })
})
