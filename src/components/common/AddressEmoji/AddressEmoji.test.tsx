import { ethereumAddressToEmoji } from '.'

describe('ethereumAddressToEmoji', () => {
  it('should return the correct emoji', () => {
    const emoji = ethereumAddressToEmoji('0x0000000000000000000000000000000000000000')
    expect(emoji).toBe('😀')
  })

  it('should return an emoji for the entire range of addresses', () => {
    const hexChars = 4
    for (let i = 0; i < 16 ** hexChars; i++) {
      const address = `0x${i.toString(16).padStart(4, '0')}`
      const emoji = ethereumAddressToEmoji(address)
      //console.log(address, emoji)
      expect(emoji).toBeDefined()
      expect(emoji).not.toBe('')
    }
  })
})
