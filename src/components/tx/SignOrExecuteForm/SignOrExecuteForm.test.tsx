import { act, fireEvent, render } from '@/tests/test-utils'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm/index'
import { SafeSignature, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as useGasLimitHook from '@/hooks/useGasLimit'
import * as txSender from '@/services/tx/txSender'
import * as wallet from '@/hooks/wallets/useWallet'
import * as walletUtils from '@/hooks/wallets/wallets'
import * as web3 from '@/hooks/wallets/web3'
import { SafeInfo, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { waitFor } from '@testing-library/react'
import { ConnectedWallet } from '@/services/onboard'
import * as safeCoreSDK from '@/hooks/coreSDK/safeCoreSDK'
import Safe from '@gnosis.pm/safe-core-sdk'
import { Web3Provider } from '@ethersproject/providers'

const createSafeTx = (): SafeTransaction => {
  return {
    data: {
      to: '0x0000000000000000000000000000000000000000',
      value: '0x0',
      data: '0x',
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
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(web3, 'useWeb3').mockReturnValue(mockProvider)
    jest
      .spyOn(txSender, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({ txId: '0x12' } as TransactionDetails)))

    jest.spyOn(txSender, 'dispatchTxExecution').mockImplementation(jest.fn())
    jest.spyOn(walletUtils, 'shouldUseEthSignMethod').mockImplementation(jest.fn(() => false))
  })

  it('displays decoded data if there is a tx', () => {
    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="mockTxId" />)

    expect(result.getByText('Transaction details')).toBeInTheDocument()
  })

  it('doesnt display decoded data if there is no tx', () => {
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={undefined} />)

    expect(result.queryByText('Transaction details')).not.toBeInTheDocument()
  })

  it('displays an execute checkbox if tx can be executed', () => {
    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.getByText('Execute transaction')).toBeInTheDocument()
  })

  it('doesnt display an execute checkbox if execution is the only option', () => {
    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    expect(result.queryByText('Execute transaction')).not.toBeInTheDocument()
  })

  it('displays an error if gas limit estimation fails', () => {
    jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
      gasLimit: undefined,
      gasLimitError: new Error('Error estimating gas limit'),
      gasLimitLoading: false,
    })

    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    expect(
      result.getByText('This transaction will most likely fail. To save gas costs, avoid creating the transaction.'),
    ).toBeInTheDocument()
  })

  it('hides the gas limit estimation error if its not an execution', () => {
    jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
      gasLimit: undefined,
      gasLimitError: new Error('Error estimating gas limit'),
      gasLimitLoading: false,
    })

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.getByText('This transaction will most likely fail. To save gas costs, avoid creating the transaction.'),
    ).toBeInTheDocument()

    act(() => {
      fireEvent.click(result.getByText('Execute transaction'))
    })

    expect(
      result.queryByText('This transaction will most likely fail. To save gas costs, avoid creating the transaction.'),
    ).not.toBeInTheDocument()
  })

  it('displays an error if passed through props', () => {
    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} error={new Error('Some error')} />,
    )

    expect(
      result.getByText('This transaction will most likely fail. To save gas costs, avoid creating the transaction.'),
    ).toBeInTheDocument()
  })

  it('displays an error if execution submission fails', async () => {
    jest.spyOn(txSender, 'dispatchTxProposal').mockImplementation(() => {
      throw new Error('Error while dispatching')
    })

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

  it('disables the submit button if gas limit is estimating', () => {
    jest.spyOn(useGasLimitHook, 'default').mockReturnValue({
      gasLimit: undefined,
      gasLimitError: undefined,
      gasLimitLoading: true,
    })

    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} />,
    )

    expect(result.getByText('Estimating...')).toBeDisabled()
  })

  it('executes a transaction', async () => {
    const executionSpy = jest.spyOn(txSender, 'dispatchTxExecution')
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
    // @ts-ignore
    mockTx.data.nonce = 101

    const signSpy = jest.spyOn(txSender, 'dispatchTxSigning').mockReturnValue(Promise.resolve(mockTx))
    const proposeSpy = jest.spyOn(txSender, 'dispatchTxProposal')
    jest.spyOn(walletUtils, 'isSmartContractWallet').mockImplementation(() => Promise.resolve(false))

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(signSpy).toHaveBeenCalledTimes(1))
    expect(proposeSpy).toHaveBeenCalledTimes(1)
  })

  it('on-chain signs a transaction', async () => {
    const mockTx = createSafeTx()
    // @ts-ignore
    mockTx.data.nonce = 101

    const onChainSignSpy = jest.spyOn(txSender, 'dispatchOnChainSigning').mockReturnValue(Promise.resolve(mockTx))
    const proposeSpy = jest.spyOn(txSender, 'dispatchTxProposal')
    jest.spyOn(walletUtils, 'isSmartContractWallet').mockImplementation(() => Promise.resolve(true))

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(onChainSignSpy).toHaveBeenCalledTimes(1))
    expect(proposeSpy).toHaveBeenCalledTimes(1)
  })
})
