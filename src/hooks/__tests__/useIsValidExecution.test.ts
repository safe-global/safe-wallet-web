import { BigNumber } from '@ethersproject/bignumber'
import type { SafeTransaction, SafeSignature } from '@safe-global/safe-core-sdk-types'
import * as useWallet from '@/hooks/wallets/useWallet'
import { act, renderHook } from '@/tests/test-utils'
import useIsValidExecution from '../useIsValidExecution'
import type { EthersError } from '@/utils/ethers-utils'
import type { EthersTxReplacedReason } from '@/utils/ethers-utils'
import * as web3 from '@/hooks/wallets/web3'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { type EIP1193Provider } from '@web3-onboard/core'
import * as contracts from '@/services/contracts/safeContracts'
import type GnosisSafeContractEthers from '@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers'

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
  const mockReadOnlyProvider: JsonRpcProvider = new JsonRpcProvider()
  const mockProvider: Web3Provider = new Web3Provider(jest.fn())
  const mockWallet = {
    address: '',
    chainId: '5',
    label: '',
    provider: {} as unknown as EIP1193Provider,
  }

  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => mockReadOnlyProvider)
    jest.spyOn(useWallet, 'default').mockReturnValue(mockWallet)
    jest.spyOn(web3, 'createWeb3').mockImplementation(() => mockProvider)
  })

  it('should append the error code description to the error thrown', async () => {
    const error = new Error('Some error') as EthersError
    error.reason = 'GS026' as EthersTxReplacedReason

    jest.spyOn(contracts, 'getCurrentGnosisSafeContract').mockImplementation(
      () =>
        ({
          contract: {
            callStatic: {
              execTransaction: () => {
                throw error
              },
            },
          },
        } as unknown as GnosisSafeContractEthers),
    )

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
