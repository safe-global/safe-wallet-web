import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import * as web3 from '@/hooks/wallets/web3'
import * as chain from '@/hooks/useChains'
import * as wallet from '@/hooks/wallets/useWallet'
import * as wrongChain from '@/hooks/useIsWrongChain'
import * as logic from '@/components/create-safe/logic'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { waitFor } from '@testing-library/react'

const mockSafeInfo = {
  data: '0x',
  from: '0x1',
  to: '0x2',
  nonce: 1,
  value: BigNumber.from(0),
  startBlock: 1,
}

describe('useSafeCreation', () => {
  const mockPendingSafe = {
    name: 'joyful-rinkeby-safe',
    threshold: 1,
    owners: [],
    saltNonce: 123,
    address: '0x10',
  }

  const mockSetPendingSafe = jest.fn()

  const mockStatus = SafeCreationStatus.AWAITING
  const mockSetStatus = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    const mockProviderReadOnly = new JsonRpcProvider()
    const mockChain = {
      chainId: '4',
    } as unknown as ChainInfo

    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => mockProviderReadOnly)
    jest.spyOn(chain, 'useCurrentChain').mockImplementation(() => mockChain)
  })

  it('should create a safe if there is no txHash and status is AWAITING', async () => {
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(true)
    jest.spyOn(logic, 'getSafeCreationTxInfo').mockReturnValue(Promise.resolve(mockSafeInfo))
    const createSafeSpy = jest.spyOn(logic, 'createNewSafe')

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, mockStatus, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).toHaveBeenCalled()
    })
  })

  it.todo('should not create a safe if the status is not AWAITING')
  it.todo('should not create a safe if there is a txHash')
  it.todo('should watch a tx if there is a txHash')
  it.todo('should not watch a tx if there is no txHash')
  it.todo('should set a PROCESSING state when watching a tx')
})
