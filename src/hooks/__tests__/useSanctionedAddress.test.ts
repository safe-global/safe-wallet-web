import { renderHook } from '@/tests/test-utils'
import { useSanctionedAddress } from '../useSanctionedAddress'
import useSafeAddress from '../useSafeAddress'
import useWallet from '../wallets/useWallet'
import { faker } from '@faker-js/faker'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import * as ofac from '@/store/api/ofac'
import { skipToken } from '@reduxjs/toolkit/query'

jest.mock('@/hooks/useSafeAddress')
jest.mock('@/hooks/wallets/useWallet')

describe('useSanctionedAddress', () => {
  const mockUseSafeAddress = useSafeAddress as jest.MockedFunction<typeof useSafeAddress>
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>

  it('should return undefined without safeAddress and wallet', () => {
    const { result } = renderHook(() => useSanctionedAddress())
    expect(result.current).toBeUndefined()
  })

  it('should return undefined if neither safeAddress nor wallet are sanctioned', () => {
    mockUseSafeAddress.mockReturnValue(faker.finance.ethereumAddress())
    mockUseWallet.mockReturnValue(connectedWalletBuilder().build())

    jest.spyOn(ofac, 'useGetIsSanctionedQuery').mockReturnValue({ data: false, refetch: jest.fn() })

    const { result } = renderHook(() => useSanctionedAddress())
    expect(result.current).toBeUndefined()
  })

  it('should return safeAddress if it is sanctioned', () => {
    const mockSafeAddress = faker.finance.ethereumAddress()
    const mockWalletAddress = faker.finance.ethereumAddress()
    mockUseSafeAddress.mockReturnValue(mockSafeAddress)
    mockUseWallet.mockReturnValue(connectedWalletBuilder().with({ address: mockWalletAddress }).build())

    jest
      .spyOn(ofac, 'useGetIsSanctionedQuery')
      .mockImplementation((address) => ({ data: address === mockSafeAddress, refetch: jest.fn() }))

    const { result } = renderHook(() => useSanctionedAddress())
    expect(result.current).toEqual(mockSafeAddress)
  })

  it('should return walletAddress if it is sanctioned', () => {
    const mockSafeAddress = faker.finance.ethereumAddress()
    const mockWalletAddress = faker.finance.ethereumAddress()
    mockUseSafeAddress.mockReturnValue(mockSafeAddress)
    mockUseWallet.mockReturnValue(connectedWalletBuilder().with({ address: mockWalletAddress }).build())

    jest
      .spyOn(ofac, 'useGetIsSanctionedQuery')
      .mockImplementation((address) => ({ data: address === mockWalletAddress, refetch: jest.fn() }))

    const { result } = renderHook(() => useSanctionedAddress())
    expect(result.current).toEqual(mockWalletAddress)
  })

  it('should return safeAddress if both are sanctioned', () => {
    const mockSafeAddress = faker.finance.ethereumAddress()
    const mockWalletAddress = faker.finance.ethereumAddress()
    mockUseSafeAddress.mockReturnValue(mockSafeAddress)
    mockUseWallet.mockReturnValue(connectedWalletBuilder().with({ address: mockWalletAddress }).build())

    jest.spyOn(ofac, 'useGetIsSanctionedQuery').mockImplementation((arg) => {
      if (arg === skipToken) {
        return { data: undefined, refetch: jest.fn() }
      }
      return { data: true, refetch: jest.fn() }
    })
    const { result } = renderHook(() => useSanctionedAddress())
    expect(result.current).toEqual(mockSafeAddress)
  })

  it('should skip sanction check if isRestricted is false', () => {
    const mockSafeAddress = faker.finance.ethereumAddress()
    const mockWalletAddress = faker.finance.ethereumAddress()
    mockUseSafeAddress.mockReturnValue(mockSafeAddress)
    mockUseWallet.mockReturnValue(connectedWalletBuilder().with({ address: mockWalletAddress }).build())

    jest.spyOn(ofac, 'useGetIsSanctionedQuery').mockImplementation((arg) => {
      if (arg === skipToken) {
        return { data: undefined, refetch: jest.fn() }
      }
      return { data: true, refetch: jest.fn() }
    })

    const { result } = renderHook(() => useSanctionedAddress(false))
    expect(result.current).toBeUndefined()
  })
})
