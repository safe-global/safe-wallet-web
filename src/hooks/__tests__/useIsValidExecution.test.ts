import { BigNumber } from '@ethersproject/bignumber'
import type { SafeTransaction, SafeSignature } from '@safe-global/safe-core-sdk-types'
import type Safe from '@safe-global/safe-core-sdk'

import * as sdk from '@/hooks/coreSDK/safeCoreSDK'
import { act, renderHook } from '@/tests/test-utils'
import useIsValidExecution from '../useIsValidExecution'
import type { EthersError } from '@/utils/ethers-utils'
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

// `isValidTransaction` has full test coverage in `safe-core-sdk`
// https://github.com/safe-global/safe-core-sdk/blob/main/packages/safe-core-sdk/tests/execution.test.ts#L37-L101

describe('useIsValidExecution', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should append the error code description to the error thrown', async () => {
    const error = new Error('Some error') as EthersError
    error.reason = 'GS026' as EthersTxReplacedReason

    jest.spyOn(sdk, 'useSafeSDK').mockReturnValue({
      isValidTransaction: jest.fn().mockRejectedValue(error),
    } as unknown as Safe)

    const mockTx = createSafeTx()
    const mockGas = BigNumber.from(1000)

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
