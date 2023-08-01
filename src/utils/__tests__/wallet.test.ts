import { isWalletUnlocked, WalletNames } from '../wallets'

describe('utils/wallet', () => {
  it('should check if MetaMask is unlocked and return false', async () => {
    // mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        isMetaMask: true,
        selectedAddress: '0x123',
        isConnected: () => true,
        _metamask: {
          isUnlocked: () => Promise.resolve(false),
        },
      },
      writable: true,
    })
    const result = await isWalletUnlocked(WalletNames.METAMASK)
    expect(result).toBe(false)
  })

  it('should check if MetaMask is unlocked and return true', async () => {
    // mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        isMetaMask: true,
        selectedAddress: '0x123',
        isConnected: () => true,
        _metamask: {
          isUnlocked: () => Promise.resolve(true),
        },
      },
      writable: true,
    })
    const result = await isWalletUnlocked(WalletNames.METAMASK)
    expect(result).toBe(true)
  })

  it('should check if WalletConnect v1 is unlocked', async () => {
    window.localStorage.setItem('walletconnect', 'true')

    expect(await isWalletUnlocked(WalletNames.WALLET_CONNECT)).toBe(true)

    window.localStorage.removeItem('walletconnect')

    expect(await isWalletUnlocked(WalletNames.WALLET_CONNECT)).toBe(false)
  })

  it('should check if WalletConnect v2 is unlocked', async () => {
    window.localStorage.setItem('wc@2:client:0.3//session', '[{"topic":"123"}]')

    expect(await isWalletUnlocked(WalletNames.WALLET_CONNECT_V2)).toBe(true)

    window.localStorage.removeItem('wc@2:client:0.3//session')

    expect(await isWalletUnlocked(WalletNames.WALLET_CONNECT_V2)).toBe(false)
  })

  it('should return false for unhandled wallets', async () => {
    expect(await isWalletUnlocked('PINEAPPLE')).toBe(false)
  })
})
