import { _isSafeSrc } from '.'

describe('SafeAppIconCard', () => {
  it('should detect unsafe src', () => {
    expect(_isSafeSrc('https://google.com/test.jpg')).toBe(false)
    expect(_isSafeSrc('data:image/png;base64,')).toBe(false)
  })

  it('should detect safe src', () => {
    expect(_isSafeSrc('https://safe-transaction-assets.safe.global/contracts/logos/0x34CfAC646f3.png')).toBe(true)
    expect(_isSafeSrc('https://safe-transaction-assets.staging.5afe.dev/contracts/logos/0x34CfAC.png')).toBe(true)
    expect(_isSafeSrc('/images/transactions/incoming.svg')).toBe(true)
  })
})
