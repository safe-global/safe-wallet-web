import BigNumber from "bignumber.js";
import * as formatters from "../formatters";

describe('shortenAddress', () => {
  it('should shorten an address', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890')).toEqual('0x1234...7890');
  })

  it('should shorten an address with custom length', () => {
    expect(formatters.shortenAddress('0x1234567890123456789012345678901234567890', 5)).toEqual('0x12345...67890');
  })
})

describe('formatDecimals', () => {
  it('should format decimals', () => {
    expect(formatters.formatDecimals('100000000000000000')).toEqual('0.1');
  })

  it('should format decimals with custom decimals', () => {
    expect(formatters.formatDecimals('1000000000000000000', 6)).toEqual('1000000000000');
  })
})

describe('toDecimals', () => {
  it('should convert to decimals', () => {
    expect(formatters.toDecimals('2.01')).toEqual(new BigNumber('2010000000000000000'));
  })

  it('should convert to decimals with custom decimals', () => {
    expect(formatters.toDecimals('3', 6)).toEqual(new BigNumber('3000000'));
  })
})
