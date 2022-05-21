import { createTokenTransferParams } from '../tokenTransferParams'

// Test createTokenTransferParams
describe('createTokenTransferParams', () => {
  it('should encode the transfer of 2 ETH', () => {
    const recipient = '0x0000000000000000000000000000000000000000'
    const amount = '2'
    const decimals = 18
    const tokenAddress = '0x0000000000000000000000000000000000000000'
    const txParams = createTokenTransferParams(recipient, amount, decimals, tokenAddress)
    expect(txParams.to).toBe(recipient)
    expect(txParams.value).toBe('2000000000000000000')
    expect(txParams.data).toBe('0x')
  })

  it('should encode the transfer of 0.1 USDC', () => {
    const recipient = '0x0000000000000000000000000000000000000000'
    const amount = '0.1'
    const decimals = 6
    const tokenAddress = '0x0000000000000000000000000000000000000001'
    const txParams = createTokenTransferParams(recipient, amount, decimals, tokenAddress)
    expect(txParams.to).toBe(tokenAddress)
    expect(txParams.value).toBe('0x0')
    expect(txParams.data).toBe(
      '0xa9059cbb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000186a0',
    )
  })
})
