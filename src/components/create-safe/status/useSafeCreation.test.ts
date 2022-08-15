import { renderHook } from '@/tests/test-utils'
import * as createSafe from '@/components/create-safe/sender'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import * as pendingSafe from '@/components/create-safe/usePendingSafe'
import * as web3 from '@/hooks/wallets/web3'
import * as wallet from '@/hooks/wallets/useWallet'
import * as wrongChain from '@/hooks/useIsWrongChain'
import { waitFor } from '@testing-library/react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { checkSafeCreationTx } from '@/components/create-safe/status/usePendingSafeCreation'
import { ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'

describe('useSafeCreation', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    const mockProviderReadOnly = new JsonRpcProvider()
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => mockProviderReadOnly)
  })

  it('should return an AWAITING_WALLET state by default', () => {
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.AWAITING_WALLET)
  })

  it('should return an AWAITING_WALLET state if a wallet is connected on the wrong chain', () => {
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(true)
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.AWAITING_WALLET)
  })

  it('should return an AWAITING state if a wallet is connected on the correct chain', () => {
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.AWAITING)
  })

  it('should return MINING if there is a txHash', async () => {
    const mockSafe: Safe = new Safe()
    mockSafe.getAddress = jest.fn(() => '0x0')
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        threshold: 1,
        owners: [],
        saltNonce: 123,
        chainId: '4',
        safeAddress: '0x10',
        txHash: '0x123',
      },
      jest.fn,
    ])

    const { result } = renderHook(() => useSafeCreation())
    expect(result.current.status).toBe(SafeCreationStatus.MINING)
  })

  it('should return SUCCESS if the safe creation promise resolves', async () => {
    const mockSafe: Safe = new Safe()
    mockSafe.getAddress = jest.fn(() => '0x0')
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    jest.spyOn(createSafe, 'createNewSafe').mockImplementation(() => Promise.resolve(mockSafe))
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        address: '0x10',
        threshold: 1,
        owners: [],
        saltNonce: 123,
        chainId: '4',
      },
      jest.fn,
    ])

    const { result } = renderHook(() => useSafeCreation())

    await waitFor(() => {
      expect(result.current.status).toBe(SafeCreationStatus.SUCCESS)
    })
  })

  it('should return ERROR if the safe creation promise rejects', async () => {
    const mockSafe: Safe = new Safe()
    mockSafe.getAddress = jest.fn(() => '0x0')
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    jest.spyOn(createSafe, 'computeNewSafeAddress').mockImplementation(() => Promise.resolve(ZERO_ADDRESS))
    jest.spyOn(createSafe, 'createNewSafe').mockImplementation(() => Promise.reject(mockSafe))
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        address: '0x10',
        threshold: 1,
        owners: [],
        saltNonce: 123,
        chainId: '4',
      },
      jest.fn,
    ])

    const { result } = renderHook(() => useSafeCreation())

    await waitFor(() => {
      expect(result.current.status).toBe(SafeCreationStatus.ERROR)
    })
  })
})

const provider = new JsonRpcProvider()

describe('monitorSafeCreationTx', () => {
  let waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')

  beforeEach(() => {
    jest.resetAllMocks()

    waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')
  })

  it('returns SUCCESS if promise was resolved', async () => {
    const receipt = {
      status: 1,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, '0x0')

    expect(result).toBe(SafeCreationStatus.SUCCESS)
  })

  it('returns REVERTED if transaction was reverted', async () => {
    const receipt = {
      status: 0,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, '0x0')

    expect(result).toBe(SafeCreationStatus.REVERTED)
  })

  it('returns TIMEOUT if transaction couldnt be found within the timout limit', async () => {
    waitForTxSpy.mockImplementationOnce(() => Promise.reject())

    const result = await checkSafeCreationTx(provider, '0x0')

    expect(result).toBe(SafeCreationStatus.TIMEOUT)
  })
})
