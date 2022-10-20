import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import type { SafeTransaction, SafeSignature } from '@gnosis.pm/safe-core-sdk-types'

import * as safeContracts from '@/services/contracts/safeContracts'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import { act, renderHook } from '@/tests/test-utils'
import useIsValidExecution from '../useIsValidExecution'
import type { EthersError } from '@/utils/ethers-utils'
import type { ConnectedWallet } from '../wallets/useOnboard'

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

const mockTx = createSafeTx()
const mockGas = BigNumber.from(1000)

describe('useIsValidExecution', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(useWalletHook, 'default').mockReturnValue({
      address: ethers.utils.hexZeroPad('0x123', 20),
    } as ConnectedWallet)
  })

  it('should return a boolean if the transaction is valid', async () => {
    jest.spyOn(safeContracts, 'getSpecificGnosisSafeContractInstance').mockReturnValue({
      contract: {
        // @ts-expect-error
        callStatic: {
          execTransaction: jest.fn(() => Promise.resolve(true)),
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
    error.reason = 'GS026'

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
