import * as formatters from '@/utils/formatters'

describe('shortenAddress', () => {
  it('should shorten an address', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890')).toEqual('0x1234...7890')
  })

  it('should shorten an address with custom length', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890', 5)).toEqual('0x12345...67890')
  })
})
