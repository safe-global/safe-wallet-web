import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/useSafeCreation'
import * as pendingSafe from '@/components/create-safe/usePendingSafe'
import * as createSafe from '@/components/create-safe/Review'
import * as web3 from '@/hooks/wallets/web3'
import { waitFor } from '@testing-library/react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { Web3Provider } from '@ethersproject/providers'

describe('useSafeCreation', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
  })

  it('should return a PENDING state by default', () => {
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.PENDING)
  })

  it('should return SUCCESS if the safe creation promise resolves', async () => {
    const mockSafe: Safe = new Safe()
    mockSafe.getAddress = jest.fn(() => '0x0')
    jest.spyOn(createSafe, 'createNewSafe').mockImplementation(() => Promise.resolve(mockSafe))
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        threshold: 1,
        owners: [],
        saltNonce: 123,
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
    jest.spyOn(createSafe, 'createNewSafe').mockImplementation(() => Promise.reject(mockSafe))
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        threshold: 1,
        owners: [],
        saltNonce: 123,
      },
      jest.fn,
    ])

    const { result } = renderHook(() => useSafeCreation())

    await waitFor(() => {
      expect(result.current.status).toBe(SafeCreationStatus.ERROR)
    })
  })

  it('should monitor an existing tx and return a PENDING state', () => {
    jest.spyOn(pendingSafe, 'usePendingSafe').mockImplementation(() => [
      {
        name: 'joyful-rinkeby-safe',
        threshold: 1,
        owners: [],
        saltNonce: 123,
        txHash: '0x0',
      },
      jest.fn,
    ])
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.PENDING)
    // TODO: assert that tx monitor was called
  })
})
