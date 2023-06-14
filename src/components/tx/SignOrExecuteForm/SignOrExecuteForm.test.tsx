import { act, fireEvent, render } from '@/tests/test-utils'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm/index'
import type { SafeSignature, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as useGasLimitHook from '@/hooks/useGasLimit'
import * as useChainsHook from '@/hooks/useChains'
import * as txSenderDispatch from '@/services/tx/tx-sender/dispatch'
import * as wallet from '@/hooks/wallets/useWallet'
import * as onboard from '@/hooks/wallets/useOnboard'
import * as walletUtils from '@/utils/wallets'
import * as web3 from '@/hooks/wallets/web3'
import type { ChainInfo, SafeInfo, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { waitFor } from '@testing-library/react'
import type { ConnectedWallet } from '@/services/onboard'
import * as safeCoreSDK from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import * as wrongChain from '@/hooks/useIsWrongChain'
import * as useIsValidExecutionHook from '@/hooks/useIsValidExecution'
import * as useChains from '@/hooks/useChains'
import * as useRelaysBySafe from '@/hooks/useRemainingRelays'
import { FEATURES } from '@/utils/chains'
import { type OnboardAPI } from '@web3-onboard/core'

jest.mock('@/hooks/useIsWrongChain', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}))

export const createSafeTx = (data = '0x'): SafeTransaction => {
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
        version: '1.3.0',
        address: { value: ethers.utils.hexZeroPad('0x000', 20) },
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
      label: 'MetaMask',
      address: ethers.utils.hexZeroPad('0x123', 20),
    } as ConnectedWallet)
    jest.spyOn(onboard, 'default').mockReturnValue({} as OnboardAPI)
    jest.spyOn(web3, 'useWeb3').mockReturnValue(mockProvider)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    jest
      .spyOn(txSenderDispatch, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({ txId: '0x12' } as TransactionDetails)))
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      features: [FEATURES.RELAYING],
      chainId: '5',
    } as unknown as ChainInfo)
    jest.spyOn(walletUtils, 'isSmartContractWallet').mockResolvedValue(false)
    jest.spyOn(useRelaysBySafe, 'useRelaysBySafe').mockReturnValue([{ remaining: 5, limit: 5 }, undefined, false])
  })

  it('displays decoded data if there is a tx', () => {
    const mockTx = createSafeTx('0x123')
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="mockTxId" />)

    expect(result.getByText('Transaction details')).toBeInTheDocument()
  })

  it('displays decoded data if tx is a native transfer', () => {
    const mockTx = createSafeTx()

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.queryByText('Transaction details')).toBeInTheDocument()

    // Click on it
    fireEvent.click(result.getByText('Transaction details'))

    expect(result.queryByText('Native token transfer')).toBeInTheDocument()
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
        version: '1.3.0',
        address: { value: ethers.utils.hexZeroPad('0x000', 20) },
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

    it('hides the execution validation error', () => {
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
      label: 'MetaMask',
      address: ethers.utils.hexZeroPad('0x789', 20),
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={false} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.getByText(
        "You are currently not an owner of this Safe Account and won't be able to submit this transaction.",
      ),
    ).toBeInTheDocument()
    expect(result.getByText('Submit')).toBeDisabled()
  })

  it('displays an error and disables the submit button if Safe attempts to execute own transaction', () => {
    const address = ethers.utils.hexZeroPad('0x789', 20)

    jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
      safeAddress: address,
      safe: {
        version: '1.3.0',
        address: { value: address },
        owners: [{ value: address }],
        nonce: 100,
      } as SafeInfo,
      safeLoaded: true,
      safeLoading: false,
      safeError: undefined,
    })

    jest.spyOn(wallet, 'default').mockReturnValue({
      chainId: '1',
      label: 'MetaMask',
      address: address,
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable onlyExecute onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.getByText(
        'Cannot execute a transaction from the Safe Account itself, please connect a different account.',
      ),
    ).toBeInTheDocument()
    expect(result.getByText('Submit')).toBeDisabled()
  })

  describe('adjusts the generic error text creating/executing transactions', () => {
    it('displays an error for newly created transactions', () => {
      jest.spyOn(wallet, 'default').mockReturnValue({
        label: 'MetaMask',
        address: ethers.utils.hexZeroPad('0x456', 20),
      } as ConnectedWallet)

      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: ethers.utils.hexZeroPad('0x123', 20),
        safe: {
          version: '1.3.0',
          address: { value: ethers.utils.hexZeroPad('0x000', 20) },
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
      label: 'MetaMask',
      address: ethers.utils.hexZeroPad('0x789', 20),
    } as ConnectedWallet)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable onlyExecute onSubmit={jest.fn} safeTx={mockTx} />)

    expect(
      result.queryByText(
        "You are currently not an owner of this Safe Account and won't be able to submit this transaction.",
      ),
    ).not.toBeInTheDocument()
    expect(result.getByText('Submit')).not.toBeDisabled()
  })

  it('displays a warning if connected wallet is on a different chain', async () => {
    jest.spyOn(wrongChain, 'default').mockReturnValue(true)
    jest
      .spyOn(useChainsHook, 'useCurrentChain')
      .mockReturnValue({ chainName: 'Goerli', features: [] as FEATURES[] } as ChainInfo)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    expect(result.getByText('Wallet network switch')).toBeInTheDocument()
    expect(result.getByText('Submit')).not.toBeDisabled()
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

  it('relays a 2 out of 2 signed transaction with a connected EOA', async () => {
    const signSpy = jest.fn(() => Promise.resolve({}))
    const relaySpy = jest.fn()
    const proposeSpy = jest.fn(() => Promise.resolve({ txId: '0xdead' }))
    jest.spyOn(txSenderDispatch, 'dispatchTxSigning').mockImplementation(signSpy as any)
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(proposeSpy as any)
    jest.spyOn(txSenderDispatch, 'dispatchTxRelay').mockImplementation(relaySpy)

    const mockTx = createSafeTx()

    mockTx.addSignature({
      signer: '0x123',
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })
    mockTx.addSignature({
      signer: '0x1234',
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="0xdead" />)

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(signSpy).not.toHaveBeenCalledTimes(1)
      expect(proposeSpy).not.toHaveBeenCalledTimes(1)
      expect(relaySpy).toHaveBeenCalledTimes(1)
    })
  })

  it('should not relay a not fully signed transaction with a connected SC wallet', async () => {
    const relaySpy = jest.fn()
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(jest.fn(() => Promise.resolve({})) as any)
    jest.spyOn(txSenderDispatch, 'dispatchTxRelay').mockImplementation(relaySpy)

    // SC wallet connected
    jest.spyOn(walletUtils, 'isSmartContractWallet').mockResolvedValue(true)

    const mockTx = createSafeTx()

    mockTx.addSignature({
      signer: '0x123',
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="0xdead" />)

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(relaySpy).toHaveBeenCalledTimes(0))
  })

  it('relays a fully signed transaction with a connected SC wallet', async () => {
    const relaySpy = jest.fn()
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(jest.fn(() => Promise.resolve({})) as any)
    jest.spyOn(txSenderDispatch, 'dispatchTxRelay').mockImplementation(relaySpy)

    // SC wallet connected
    jest.spyOn(walletUtils, 'isSmartContractWallet').mockResolvedValue(true)

    const mockTx = createSafeTx()

    mockTx.addSignature({
      signer: '0x123',
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })

    mockTx.addSignature({
      signer: '0x345',
      data: '0xAAA',
      staticPart: () => '0xAAA',
      dynamicPart: () => '',
    })

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="0xdead" />)

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(relaySpy).toHaveBeenCalledTimes(1))
  })

  it('relays a fully signed transaction with a connected EOA', async () => {
    const relaySpy = jest.fn()
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(jest.fn(() => Promise.resolve({})) as any)
    jest.spyOn(txSenderDispatch, 'dispatchTxRelay').mockImplementation(relaySpy)

    const mockTx = createSafeTx()

    mockTx.addSignature({
      signer: '0x123',
      data: '0xEEE',
      staticPart: () => '0xEEE',
      dynamicPart: () => '',
    })

    mockTx.addSignature({
      signer: '0x345',
      data: '0xAAA',
      staticPart: () => '0xAAA',
      dynamicPart: () => '',
    })

    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} txId="0xdead" />)

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(relaySpy).toHaveBeenCalledTimes(1))
  })

  it('executes a transaction with the connected wallet if chosen instead of relaying', async () => {
    jest.spyOn(useRelaysBySafe, 'useRelaysBySafe').mockReturnValue([{ remaining: 5, limit: 5 }, undefined, false])

    const executionSpy = jest.fn()
    jest
      .spyOn(txSenderDispatch, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({} as TransactionDetails)))

    jest.spyOn(txSenderDispatch, 'dispatchTxExecution').mockImplementation(executionSpy)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    await act(() => Promise.resolve())

    const walletOptionRadio = result.getByText('Connected wallet')

    expect(walletOptionRadio).toBeInTheDocument()

    act(() => {
      fireEvent.click(walletOptionRadio)
    })

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(executionSpy).toHaveBeenCalledTimes(1))
  })

  it('when there are no remaining relays, there should be no option to select the execution method', async () => {
    jest.spyOn(useRelaysBySafe, 'useRelaysBySafe').mockReturnValue([{ remaining: 0, limit: 5 }, undefined, false])

    const executionSpy = jest.fn()
    jest
      .spyOn(txSenderDispatch, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({} as TransactionDetails)))

    jest.spyOn(txSenderDispatch, 'dispatchTxExecution').mockImplementation(executionSpy)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    await act(() => Promise.resolve())

    const walletOptionRadio = result.queryByText('Connected wallet')

    expect(walletOptionRadio).not.toBeInTheDocument()
  })

  it('executes a transaction with the connected wallet if relaying is not available', async () => {
    jest.spyOn(useRelaysBySafe, 'useRelaysBySafe').mockReturnValue([{ remaining: 0, limit: 5 }, undefined, false])

    const executionSpy = jest.fn()
    jest
      .spyOn(txSenderDispatch, 'dispatchTxProposal')
      .mockImplementation(jest.fn(() => Promise.resolve({} as TransactionDetails)))

    jest.spyOn(txSenderDispatch, 'dispatchTxExecution').mockImplementation(executionSpy)

    const mockTx = createSafeTx()
    const result = render(<SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} />)

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => expect(executionSpy).toHaveBeenCalledTimes(1))
  })

  it('signs a transactions', async () => {
    const mockTx = createSafeTx()

    const signSpy = jest.fn(() => Promise.resolve({} as SafeTransaction))
    const proposeSpy = jest.fn(() => Promise.resolve({} as TransactionDetails))

    jest.spyOn(txSenderDispatch, 'dispatchTxSigning').mockImplementation(signSpy)
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(proposeSpy)
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

    const onChainSignSpy = jest.fn(() => Promise.resolve())
    const proposeSpy = jest.fn(() => Promise.resolve({} as TransactionDetails))

    jest.spyOn(txSenderDispatch, 'dispatchOnChainSigning').mockImplementation(onChainSignSpy)
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(proposeSpy)
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

    const onChainSignSpy = jest.fn(() => Promise.resolve())
    const proposeSpy = jest.fn(() => Promise.resolve({} as TransactionDetails))

    jest.spyOn(txSenderDispatch, 'dispatchOnChainSigning').mockImplementation(onChainSignSpy)
    jest.spyOn(txSenderDispatch, 'dispatchTxProposal').mockImplementation(proposeSpy)
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
    jest
      .spyOn(txSenderDispatch, 'dispatchTxExecution')
      .mockImplementation(jest.fn(() => Promise.reject('Error while dispatching')))
    jest
      .spyOn(txSenderDispatch, 'dispatchTxSigning')
      .mockImplementation(jest.fn(() => Promise.reject('Error while dispatching')))
    jest
      .spyOn(txSenderDispatch, 'dispatchTxRelay')
      .mockImplementation(jest.fn(() => Promise.reject('Error while dispatching')))

    const mockTx = createSafeTx()
    const result = render(
      <SignOrExecuteForm isExecutable={true} onSubmit={jest.fn} safeTx={mockTx} onlyExecute={true} txId="123" />,
    )

    await act(() => Promise.resolve())

    const submitButton = result.getByText('Submit')

    act(() => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(result.getByText('Error submitting the transaction. Please try again.')).toBeInTheDocument()
    })
  })
})
