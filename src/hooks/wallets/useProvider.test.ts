import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import * as chains from '@/hooks/useChains'
import * as web3 from '@/hooks/wallets/web3'
import * as wallet from '@/hooks/wallets/useWallet'
import { renderHook } from '@/tests/test-utils'
import { useProvider } from '@/hooks/wallets/useProvider'
import type { SettingsState } from '@/store/settingsSlice'
import type { ConnectedWallet } from '@/services/onboard'

const initHook = (isSafeApp?: boolean) => {
  return renderHook(() => useProvider(isSafeApp), {
    initialReduxState: {
      settings: { env: { rpc: { '5': '' } } } as unknown as SettingsState,
    },
  })
}

describe('useProvider', () => {
  let createWeb3Spy: jest.SpyInstance
  let createWeb3ReadOnlySpy: jest.SpyInstance
  let createSafeAppsWeb3ProviderSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    createWeb3Spy = jest.spyOn(web3, 'createWeb3')
    createWeb3ReadOnlySpy = jest.spyOn(web3, 'createWeb3ReadOnly')
    createSafeAppsWeb3ProviderSpy = jest.spyOn(web3, 'createSafeAppsWeb3Provider')
  })

  it('should return a read only provider by default if there is no wallet connected', () => {
    jest.spyOn(chains, 'useCurrentChain').mockReturnValue({ chainId: '5', rpcUri: {}, safeAppsRpcUri: {} } as ChainInfo)
    jest.spyOn(wallet, 'default').mockReturnValue(null)

    initHook()

    expect(createWeb3ReadOnlySpy).toHaveBeenCalled()

    expect(createWeb3Spy).not.toHaveBeenCalled()
    expect(createSafeAppsWeb3ProviderSpy).not.toHaveBeenCalled()
  })

  it('should return a read only Safe Apps provider if passed true and there is no wallet connected', () => {
    jest.spyOn(chains, 'useCurrentChain').mockReturnValue({ chainId: '5', rpcUri: {}, safeAppsRpcUri: {} } as ChainInfo)
    jest.spyOn(wallet, 'default').mockReturnValue(null)

    initHook(true)

    expect(createSafeAppsWeb3ProviderSpy).toHaveBeenCalled()

    expect(createWeb3Spy).not.toHaveBeenCalled()
    expect(createWeb3ReadOnlySpy).not.toHaveBeenCalled()
  })

  it('should return a read only provider by default if the wallet is not connected to the current chain', () => {
    jest.spyOn(chains, 'useCurrentChain').mockReturnValue({ chainId: '1', rpcUri: {}, safeAppsRpcUri: {} } as ChainInfo)
    jest.spyOn(wallet, 'default').mockReturnValue({ chainId: '5' } as ConnectedWallet)

    initHook()

    expect(createWeb3ReadOnlySpy).toHaveBeenCalled()

    expect(createWeb3Spy).not.toHaveBeenCalled()
    expect(createSafeAppsWeb3ProviderSpy).not.toHaveBeenCalled()
  })

  it('should return a read only Safe Apps provider if passed true and the wallet is not connected to the current chain', () => {
    jest.spyOn(chains, 'useCurrentChain').mockReturnValue({ chainId: '1', rpcUri: {}, safeAppsRpcUri: {} } as ChainInfo)
    jest.spyOn(wallet, 'default').mockReturnValue({ chainId: '5' } as ConnectedWallet)

    initHook(true)

    expect(createSafeAppsWeb3ProviderSpy).toHaveBeenCalled()

    expect(createWeb3Spy).not.toHaveBeenCalled()
    expect(createWeb3ReadOnlySpy).not.toHaveBeenCalled()
  })

  it('should return the wallet provider if the wallet is connected to the current chain', () => {
    jest.spyOn(chains, 'useCurrentChain').mockReturnValue({ chainId: '5', rpcUri: {}, safeAppsRpcUri: {} } as ChainInfo)
    jest.spyOn(wallet, 'default').mockReturnValue({ chainId: '5', provider: jest.fn() } as unknown as ConnectedWallet)

    initHook()

    expect(createWeb3Spy).toHaveBeenCalled()

    expect(createWeb3ReadOnlySpy).not.toHaveBeenCalled()
    expect(createSafeAppsWeb3ProviderSpy).not.toHaveBeenCalled()
  })
})
