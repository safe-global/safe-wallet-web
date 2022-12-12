import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import type { SafeTransaction, SafeSignature } from '@gnosis.pm/safe-core-sdk-types'
import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import * as safeContracts from '@/services/contracts/safeContracts'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import { act, renderHook } from '@/tests/test-utils'
import useIsValidExecution from '../useIsValidExecution'
import type { EthersError } from '@/utils/ethers-utils'
import type { ConnectedWallet } from '../wallets/useOnboard'
import type { EthersTxReplacedReason } from '@/utils/ethers-utils'

const createSafeTx = (data = '0x'): SafeTransaction => {
  return {
    data: {
      to: '0x0000000000000000000000000000000000000000',
      value: '0x0',
      data,
      operation: 0,
      nonce: 100,
    },
    signatures: new Map([]),
    addSignature: function (sig: SafeSignature): void {
      this.signatures.set(sig.signer, sig)
    },
    encodedSignatures: function (): string {
      return Array.from(this.signatures)
        .map(([, sig]) => {
          return [sig.signer, sig.data].join(' = ')
        })
        .join('; ')
    },
  } as SafeTransaction
}

let mockTx: SafeTransaction

const mockGas = BigNumber.from(1000)

describe('useIsValidExecution', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(useWalletHook, 'default').mockReturnValue({
      address: ethers.utils.hexZeroPad('0x123', 20),
    } as ConnectedWallet)

    jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
      safe: {
        owners: [
          {
            value: ethers.utils.hexZeroPad('0x123', 20),
          },
        ],
      } as SafeInfo,
      safeAddress: ethers.utils.hexZeroPad('0x456', 20),
      safeLoaded: true,
      safeLoading: false,
    })

    // Create a new tx for each test case
    mockTx = createSafeTx()
  })

  it('should add a missing signature and return a boolean if the transaction is valid', async () => {
    jest.spyOn(safeContracts, 'getSpecificGnosisSafeContractInstance').mockReturnValue({
      contract: {
        // @ts-expect-error
        callStatic: {
          execTransaction: jest.fn((_1, _2, _3, _4, _5, _6, _7, _8, _9, signatures: string) =>
            Promise.resolve(signatures.includes(ethers.utils.hexZeroPad('0x123', 20))),
          ),
        },
      },
    })

    const { result } = renderHook(() => useIsValidExecution(mockTx, mockGas))

    let { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toEqual(undefined)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(true)

    await act(async () => {
      await new Promise(process.nextTick)
    })
    ;({ isValidExecution, executionValidationError, isValidExecutionLoading } = result.current)

    expect(isValidExecution).toBe(true)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(false)
  })

  it('should not add a signature if no owner is connected and return a boolean if the transaction is valid', async () => {
    // Connect a different owner and add a different sig
    jest.spyOn(useWalletHook, 'default').mockReturnValue({
      address: ethers.utils.hexZeroPad('0xabc', 20),
    } as ConnectedWallet)

    jest.spyOn(safeContracts, 'getSpecificGnosisSafeContractInstance').mockReturnValue({
      contract: {
        // @ts-expect-error
        callStatic: {
          execTransaction: jest.fn((_1, _2, _3, _4, _5, _6, _7, _8, _9, signatures: string) =>
            Promise.resolve(
              signatures.includes(ethers.utils.hexZeroPad('0x123', 20)) &&
                !signatures.includes(ethers.utils.hexZeroPad('0xabc', 20)),
            ),
          ),
        },
      },
    })

    mockTx.addSignature({
      signer: ethers.utils.hexZeroPad('0x123', 20),
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })

    const { result } = renderHook(() => useIsValidExecution(mockTx, mockGas))

    let { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toEqual(undefined)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(true)

    await act(async () => {
      await new Promise(process.nextTick)
    })
    ;({ isValidExecution, executionValidationError, isValidExecutionLoading } = result.current)

    expect(isValidExecution).toBe(true)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(false)
  })

  it('should throw if the transaction is invalid', async () => {
    jest.spyOn(safeContracts, 'getSpecificGnosisSafeContractInstance').mockReturnValue({
      contract: {
        // @ts-expect-error
        callStatic: {
          execTransaction: jest.fn(() => Promise.reject('Some error')),
        },
      },
    })

    const { result } = renderHook(() => useIsValidExecution(mockTx, mockGas))

    var { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toEqual(undefined)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(true)

    await act(async () => {
      await new Promise(process.nextTick)
    })

    var { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toBe(undefined)
    expect(executionValidationError).toBe('Some error')
    expect(isValidExecutionLoading).toBe(false)
  })

  it('should append the error code description to the error thrown', async () => {
    const error = new Error('Some error') as EthersError
    error.reason = 'GS026' as EthersTxReplacedReason

    jest.spyOn(safeContracts, 'getSpecificGnosisSafeContractInstance').mockReturnValue({
      contract: {
        // @ts-expect-error
        callStatic: {
          execTransaction: jest.fn(() => Promise.reject(error)),
        },
      },
    })

    const { result } = renderHook(() => useIsValidExecution(mockTx, mockGas))

    var { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toEqual(undefined)
    expect(executionValidationError).toBe(undefined)
    expect(isValidExecutionLoading).toBe(true)

    await act(async () => {
      await new Promise(process.nextTick)
    })

    var { isValidExecution, executionValidationError, isValidExecutionLoading } = result.current

    expect(isValidExecution).toBe(undefined)
    expect((executionValidationError as EthersError)?.reason).toBe('GS026: Invalid owner provided')
    expect(isValidExecutionLoading).toBe(false)
  })
})
