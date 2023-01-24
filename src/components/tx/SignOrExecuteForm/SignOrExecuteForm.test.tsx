import { act, fireEvent, render } from '@/tests/test-utils'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm/index'
import type { SafeSignature, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as useGasLimitHook from '@/hooks/useGasLimit'
import * as txSenderDispatch from '@/services/tx/tx-sender/dispatch'
import * as txSender from '@/hooks/useTxSender'
import * as wallet from '@/hooks/wallets/useWallet'
import * as walletUtils from '@/hooks/wallets/wallets'
import * as web3 from '@/hooks/wallets/web3'
import type { SafeInfo, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { waitFor } from '@testing-library/react'
import type { ConnectedWallet } from '@/services/onboard'
import * as safeCoreSDK from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import * as wrongChain from '@/hooks/useIsWrongChain'
import * as useIsValidExecutionHook from '@/hooks/useIsValidExecution'
import type { NullableTxSenderFunctions } from '@/hooks/useTxSender'

jest.mock('@/hooks/useIsWrongChain', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}))

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

describe('SignOrExecuteForm', () => {
  let mockSDK
  const mockProvider: Web3Provider = new Web3Provider(jest.fn())

  beforeEach(() => {
    jest.resetAllMocks()

    mockSDK = {
      isModuleEnabled: jest.fn(() => false),
      createTransaction: jest.fn(() => 'asd'),
      getTransactionHash: jest.fn(() => '0x10'),
    } as unknown as Safe

    jest.spyOn(safeCoreSDK, 'getSafeSDK').mockReturnValue(mockSDK)
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        nonce: 100,
        threshold: 2,
        owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }, { value: ethers.utils.hexZeroPad('0x456', 20) }],
      } as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))
    jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
      gasLimit: undefined,
      gasLimitError: undefined,
      gasLimitLoading: false,
    })
    jest.spyOn(useIsValidExecutionHook, 'default').mockReturnValue({
      isValidExecution: undefined,
      executionValidationError: undefined,
      isValidExecutionLoading: false,
    })
    jest.spyOn(wallet, 'default').mockReturnValue({
      address: ethers.utils.hexZeroPad('0x123', 20),
    } as ConnectedWallet)
    jest.spyOn(web3, 'useWeb3').mockReturnValue(mockProvider)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    jest
      .spyOn(txSenderDispatch, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({ txId: '0x12' } as TransactionDetails)))
  })

  it('displays decoded data if there is a tx', () => {
    const mockTx = createSafeTx('0x123')
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="mockTxId" />)

    expect(result.getByText('Transaction details')).toBeInTheDocument()
  })

  it("doesn't display decoded data if tx is a native transfer", () => {
    const mockTx = createSafeTx()

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.queryByText('Transaction details')).not.toBeInTheDocument()
  })

  it('displays an execute checkbox if tx can be executed', () => {
    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} txId="123" onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.getByText('Execute transaction')).toBeInTheDocument()
  })

  it('the execute checkbox is disabled if execution is the only option', () => {
    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    expect((result.getByRole('checkbox') as HTMLInputElement).disabled).toBe(true)
  })

  it("doesn't display an execute checkbox if nonce is incorrect", () => {
    const mockTx = createSafeTx()

    // @ts-ignore
    mockTx.data.nonce = 10

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.queryByText('Execute transaction')).not.toBeInTheDocument()
  })

  it('displays an execute checkbox if safe threshold is 1', () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        nonce: 100,
        threshold: 1,
        owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }],
      } as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const mockTx = createSafeTx()

    const result = render(<SignOrExecuteForm onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.queryByText('Execute transaction')).toBeInTheDocument()
  })

  describe('hides execution-related errors if it is not an execution', () => {
    it('hides the gas limit estimation error', () => {
      jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
        gasLimit: undefined,
        gasLimitError: new Error('Error estimating gas limit'),
        gasLimitLoading: false,
      })

      const mockTx = createSafeTx()
      const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

      expect(
        result.getByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
      ).toBeInTheDocument()

      act(() => {
        fireEvent.click(result.getByText('Execute transaction'))
      })

      expect(
        result.queryByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
      ).not.toBeInTheDocument()
    })

    it('hides the executiuon validation error', () => {
      jest.spyOn(useIsValidExecutionHook, 'default').mockReturnValue({
        isValidExecution: undefined,
        executionValidationError: new Error('Error validating execution'),
        isValidExecutionLoading: false,
      })

      const mockTx = createSafeTx()
      const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

      expect(
        result.getByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
      ).toBeInTheDocument()

      act(() => {
        fireEvent.click(result.getByText('Execute transaction'))
      })

      expect(
        result.queryByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
      ).not.toBeInTheDocument()
    })
  })

  it('displays an error if passed through props', () => {
    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} error={new Error('Some error')} />,
    )

    expect(
      result.getByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
    ).toBeInTheDocument()
  })

  it('displays an error and disables the submit button if connected wallet is not an owner', () => {
    jest.spyOn(wallet, 'default').mockReturnValue({
      chainId: '1',
      address: ethers.utils.hexZeroPad('0x789', 20),
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={false} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.getByText("You are currently not an owner of this Safe and won't be able to submit this transaction."),
    ).toBeInTheDocument()
    expect(result.getByText('Submit')).toBeDisabled()
  })

  it('displays an error and disables the submit button if Safe attempts to execute own transaction', () => {
    const address = ethers.utils.hexZeroPad('0x789', 20)

    jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
      safeAddress: address,
      safe: {
        owners: [{ value: address }],
      } as SafeInfo,
      safeLoaded: true,
      safeLoading: false,
      safeError: undefined,
    })

    jest.spyOn(wallet, 'default').mockReturnValue({
      chainId: '1',
      address: address,
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={false} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.getByText('Cannot execute a transaction from the Safe itself, please connect a different account.'),
    ).toBeInTheDocument()
    expect(result.getByText('Submit')).toBeDisabled()
  })

  describe('adjusts the generic error text creating/executing transactions', () => {
    it('displays an error for newly created transactions', () => {
      jest.spyOn(wallet, 'default').mockReturnValue({
        address: ethers.utils.hexZeroPad('0x456', 20),
      } as ConnectedWallet)

      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: ethers.utils.hexZeroPad('0x123', 20),
        safe: {
          owners: [{ value: ethers.utils.hexZeroPad('0x456', 20) }],
          threshold: 1,
        } as SafeInfo,
        safeLoaded: true,
        safeLoading: false,
        safeError: undefined,
      })

      const mockTx = createSafeTx()
      const result = render(
        <SignOrExecuteForm isExecutable={false} onSubmit={jest.fn} safeTx={mockTx} error={new Error('Some error')} />,
      )

      expect(
        result.getByText('This transaction will most likely fail. To save gas costs, avoid creating the transaction.'),
      ).toBeInTheDocument()
    })

    it('displays an error for transactions being executed', () => {
      const mockTx = createSafeTx()
      const result = render(
        <SignOrExecuteForm
          isExecutable={false}
          onSubmit={jest.fn}
          safeTx={mockTx}
          txId="0x123"
          error={new Error('Some error')}
        />,
      )

      expect(
        result.getByText('This transaction will most likely fail. To save gas costs, reject this transaction.'),
      ).toBeInTheDocument()
    })
  })

  it('allows execution for non-owners', () => {
    jest.spyOn(wallet, 'default').mockReturnValue({
      chainId: '1',
      address: ethers.utils.hexZeroPad('0x789', 20),
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable onlyExecute onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.queryByText("You are currently not an owner of this Safe and won't be able to submit this transaction."),
    ).not.toBeInTheDocument()
    expect(result.getByText('Submit')).not.toBeDisabled()
  })

  it('displays an error and disables the submit button if connected wallet is on a different chain', () => {
    jest.spyOn(wrongChain, 'default').mockReturnValue(true)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.getByText('Your wallet is connected to the wrong chain.')).toBeInTheDocument()
    expect(result.getByText('Submit')).toBeDisabled()
  })

  it('disables the submit button if there is no tx', () => {
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={undefined} />)

    expect(result.getByText('Submit')).toBeDisabled()
  })

  it('disables the submit button while executing', async () => {
    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    const submitButton = result.getByText('Submit')

    act(() => {
      expect(submitButton).not.toBeDisabled()
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(submitButton).toBeDisabled())
  })

  it('disables the submit button if gas limit/execution validity is estimating', () => {
    jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
      gasLimit: undefined,
      gasLimitError: undefined,
      gasLimitLoading: true,
    })

    jest.spyOn(useIsValidExecutionHook, 'default').mockReturnValue({
      isValidExecution: undefined,
      executionValidationError: undefined,
      isValidExecutionLoading: true,
    })

    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    expect(result.getByText('Estimating...')).toBeDisabled()
  })

  it('executes a transaction', async () => {
    const executionSpy = jest.fn()
    jest.spyOn(txSender, 'default').mockImplementation(
      () =>
        ({
          dispatchTxProposal: jest.fn(() => Promise.resolve({})),
          dispatchTxExecution: executionSpy,
        } as unknown as NullableTxSenderFunctions),
    )

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(executionSpy).toHaveBeenCalledTimes(1))
  })

  it('signs a transactions', async () => {
    const mockTx = createSafeTx()

    const signSpy = jest.fn(() => Promise.resolve({}))
    const proposeSpy = jest.fn(() => Promise.resolve({}))
    jest.spyOn(txSender, 'default').mockImplementation(
      () =>
        ({
          dispatchTxSigning: signSpy,
          dispatchTxProposal: proposeSpy,
        } as unknown as NullableTxSenderFunctions),
    )

    jest.spyOn(walletUtils, 'isSmartContractWallet').mockImplementation(() => Promise.resolve(false))

    const result = render(<SignOrExecuteForm onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(signSpy).toHaveBeenCalledTimes(1))
    expect(proposeSpy).toHaveBeenCalledTimes(1)
  })

  it('smart contract wallets have to propose when creating a tx with an on-chain signature', async () => {
    const mockTx = createSafeTx()

    const onChainSignSpy = jest.fn(() => Promise.resolve({}))
    const proposeSpy = jest.fn(() => Promise.resolve({}))
    jest.spyOn(txSender, 'default').mockImplementation(
      () =>
        ({
          dispatchOnChainSigning: onChainSignSpy,
          dispatchTxProposal: proposeSpy,
        } as unknown as NullableTxSenderFunctions),
    )

    jest.spyOn(walletUtils, 'isSmartContractWallet').mockImplementation(() => Promise.resolve(true))

    const result = render(<SignOrExecuteForm onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(onChainSignSpy).toHaveBeenCalledTimes(1))
    expect(proposeSpy).toHaveBeenCalled()
  })

  it('smart contract wallets should not propose when on-chain signing an existing transactions', async () => {
    const mockTx = createSafeTx()

    const onChainSignSpy = jest.fn(() => Promise.resolve({}))
    const proposeSpy = jest.fn(() => Promise.resolve({}))
    jest.spyOn(txSender, 'default').mockImplementation(
      () =>
        ({
          dispatchOnChainSigning: onChainSignSpy,
          dispatchTxProposal: proposeSpy,
        } as unknown as NullableTxSenderFunctions),
    )

    jest.spyOn(walletUtils, 'isSmartContractWallet').mockImplementation(() => Promise.resolve(true))

    const result = render(<SignOrExecuteForm txId="0x123" onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(onChainSignSpy).toHaveBeenCalledTimes(1))
    expect(proposeSpy).not.toHaveBeenCalled()
  })

  it('displays an error if execution submission fails', async () => {
    jest.spyOn(txSender, 'default').mockImplementation(
      () =>
        ({
          dispatchTxExecution: jest.fn(() => Promise.reject('Error while dispatching')),
        } as unknown as NullableTxSenderFunctions),
    )

    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(result.getByText('Error submitting the transaction. Please try again.')).toBeInTheDocument()
    })
  })
})
