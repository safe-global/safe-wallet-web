import { renderHook } from '@/tests/test-utils'
import { hexZeroPad, Interface } from 'ethers/lib/utils'
import { useApprovalInfos } from '@/components/tx/ApprovalEditor/hooks/useApprovalInfos'
import { waitFor } from '@testing-library/react'
import { createMockSafeTransaction } from '@/tests/transactions'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import { ERC20__factory } from '@/types/contracts'
import { type ApprovalInfo } from '@/components/tx/ApprovalEditor/utils/approvals'
import * as balances from '@/hooks/useBalances'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import * as getTokenInfo from '@/utils/tokens'

const ERC20_INTERFACE = ERC20__factory.createInterface()

const createNonApproveCallData = (to: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('transfer', [to, value])
}

describe('useApprovalInfos', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('returns an empty array if no Safe Transaction exists', async () => {
    const { result } = renderHook(() => useApprovalInfos(undefined))

    expect(result.current).toStrictEqual([[], undefined, true])

    await waitFor(() => {
      expect(result.current).toStrictEqual([[], undefined, false])
    })
  })

  it('returns an empty array if the transaction does not contain any approvals', async () => {
    const mockSafeTx = createMockSafeTransaction({
      to: hexZeroPad('0x123', 20),
      data: createNonApproveCallData(hexZeroPad('0x2', 20), '20'),
      operation: OperationType.DelegateCall,
    })

    const { result } = renderHook(() => useApprovalInfos(mockSafeTx))

    await waitFor(() => {
      expect(result.current).toStrictEqual([[], undefined, false])
    })
  })

  it('returns an ApprovalInfo if the transaction contains an approval', async () => {
    const testInterface = new Interface(['function approve(address, uint256)'])

    const mockSafeTx = createMockSafeTransaction({
      to: hexZeroPad('0x123', 20),
      data: testInterface.encodeFunctionData('approve', [hexZeroPad('0x2', 20), '123']),
      operation: OperationType.DelegateCall,
    })

    const { result } = renderHook(() => useApprovalInfos(mockSafeTx))

    const mockApproval: ApprovalInfo = {
      amount: BigNumber.from('123'),
      amountFormatted: '0.000000000000000123',
      spender: '0x0000000000000000000000000000000000000002',
      tokenAddress: '0x0000000000000000000000000000000000000123',
      tokenInfo: undefined,
    }

    await waitFor(() => {
      expect(result.current).toEqual([[mockApproval], undefined, false])
    })
  })

  it('returns an ApprovalInfo with token infos if the token exists in balances', async () => {
    const mockBalanceItem = {
      balance: '40',
      fiatBalance: '40',
      fiatConversion: '1',
      tokenInfo: {
        address: hexZeroPad('0x123', 20),
        decimals: 18,
        logoUri: '',
        name: 'Hidden Token',
        symbol: 'HT',
        type: TokenType.ERC20,
      },
    }

    jest
      .spyOn(balances, 'default')
      .mockReturnValue({ balances: { fiatTotal: '0', items: [mockBalanceItem] }, error: undefined, loading: false })
    const testInterface = new Interface(['function approve(address, uint256)'])

    const mockSafeTx = createMockSafeTransaction({
      to: hexZeroPad('0x123', 20),
      data: testInterface.encodeFunctionData('approve', [hexZeroPad('0x2', 20), '123']),
      operation: OperationType.DelegateCall,
    })

    const { result } = renderHook(() => useApprovalInfos(mockSafeTx))

    const mockApproval: ApprovalInfo = {
      amount: BigNumber.from('123'),
      amountFormatted: '0.000000000000000123',
      spender: '0x0000000000000000000000000000000000000002',
      tokenAddress: '0x0000000000000000000000000000000000000123',
      tokenInfo: mockBalanceItem.tokenInfo,
    }

    await waitFor(() => {
      expect(result.current).toEqual([[mockApproval], undefined, false])
    })
  })

  it('fetches token info for an approval if its missing', async () => {
    const mockTokenInfo = {
      address: '0x0000000000000000000000000000000000000123',
      symbol: 'HT',
      decimals: 18,
      type: TokenType.ERC20,
    }
    const fetchMock = jest
      .spyOn(getTokenInfo, 'getERC20TokenInfoOnChain')
      .mockReturnValue(Promise.resolve(mockTokenInfo))
    const testInterface = new Interface(['function approve(address, uint256)'])

    const mockSafeTx = createMockSafeTransaction({
      to: hexZeroPad('0x123', 20),
      data: testInterface.encodeFunctionData('approve', [hexZeroPad('0x2', 20), '123']),
      operation: OperationType.DelegateCall,
    })

    const { result } = renderHook(() => useApprovalInfos(mockSafeTx))

    const mockApproval: ApprovalInfo = {
      amount: BigNumber.from('123'),
      amountFormatted: '0.000000000000000123',
      spender: '0x0000000000000000000000000000000000000002',
      tokenAddress: '0x0000000000000000000000000000000000000123',
      tokenInfo: mockTokenInfo,
    }

    await waitFor(() => {
      expect(result.current).toEqual([[mockApproval], undefined, false])
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })
})
