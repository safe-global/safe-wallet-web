import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import * as router from 'next/router'
import { NextRouter } from 'next/router'
import * as web3 from '@/hooks/wallets/web3'
import * as pendingSafe from '@/components/create-safe/status/usePendingSafeCreation'
import * as chainIdModule from '@/hooks/useChainId'
import { Web3Provider } from '@ethersproject/providers'
import { PendingSafeData } from '@/components/create-safe'
import useWatchSafeCreation from '@/components/create-safe/status/hooks/useWatchSafeCreation'
import { AppRoutes } from '@/config/routes'
import { chainsSlice } from '@/store/chainsSlice'
import { useAppDispatch } from '@/store'
import { GAS_PRICE_TYPE, RPC_AUTHENTICATION } from '@gnosis.pm/safe-react-gateway-sdk'

describe('useWatchSafeCreation', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
  })

  it('should clear the tx hash if it exists on ERROR or REVERTED', () => {
    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.ERROR,
        safeAddress: '0x1',
        pendingSafe: { txHash: '0x10' } as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(setPendingSafeSpy).toHaveBeenCalled()
  })

  it('should not clear the tx hash if it doesnt exist on ERROR or REVERTED', () => {
    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.ERROR,
        safeAddress: '0x1',
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(setPendingSafeSpy).not.toHaveBeenCalled()
  })

  it('should poll safe info on SUCCESS', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: '0x1',
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not poll safe info on SUCCESS if there is no safe address', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: undefined,
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).not.toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not poll safe info on SUCCESS if there is no pending safe data', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: '0x10',
        pendingSafe: undefined,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).not.toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should navigate to the dashboard on INDEXED', async () => {
    jest.spyOn(chainIdModule, 'default').mockReturnValue('4')
    const pushMock = jest.fn()
    jest.spyOn(router, 'useRouter').mockReturnValue({
      push: pushMock,
    } as unknown as NextRouter)

    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() => {
      useAppDispatch()(
        chainsSlice.actions.set({
          data: [
            {
              chainId: '4',
              chainName: 'Rinkeby',
              shortName: 'rin',
              description: 'Ethereum testnet',
              l2: false,
              rpcUri: {
                authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
                value: 'https://rinkeby.infura.io/v3/',
              },
              safeAppsRpcUri: {
                authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
                value: 'https://rinkeby.infura.io/v3/',
              },
              publicRpcUri: {
                authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
                value: 'https://rinkeby-light.eth.linkpool.io/',
              },
              blockExplorerUriTemplate: {
                address: 'https://rinkeby.etherscan.io/address/{{address}}',
                txHash: 'https://rinkeby.etherscan.io/tx/{{txHash}}',
                api: 'https://api-rinkeby.etherscan.io/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
              },
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
                logoUri: 'https://safe-transaction-assets.gnosis-safe.io/chains/4/currency_logo.png',
              },
              transactionService: 'https://safe-transaction.rinkeby.gnosis.io',
              theme: {
                textColor: '#ffffff',
                backgroundColor: '#E8673C',
              },
              gasPrice: [
                {
                  type: GAS_PRICE_TYPE.FIXED,
                  weiValue: '24000000000',
                },
              ],
              ensRegistryAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
              disabledWallets: ['fortmatic', 'lattice', 'tally'],
              features: [],
            },
          ],
          error: undefined,
          loading: false,
        }),
      )

      useWatchSafeCreation({
        status: SafeCreationStatus.INDEXED,
        safeAddress: '0x10',
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      })
    })

    expect(pushMock).toHaveBeenCalledWith({ pathname: AppRoutes.safe.home, query: { safe: 'rin:0x10' } })
  })
})
