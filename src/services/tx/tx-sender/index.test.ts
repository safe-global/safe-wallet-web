import { setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import { type TransactionResult } from '@safe-global/safe-core-sdk-types'
import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionDetails, postSafeGasEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import extractTxInfo from '../extractTxInfo'
import proposeTx from '../proposeTransaction'
import * as txEvents from '../txEvents'
import {
  createExistingTx,
  createRejectTx,
  createTx,
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxSigning,
  dispatchBatchExecutionRelay,
} from '.'
import { ErrorCode } from '@ethersproject/logger'
import { waitFor } from '@/tests/test-utils'
import { ethers } from 'ethers'
import * as safeContracts from '@/services/contracts/safeContracts'
import type MultiSendCallOnlyEthersContract from '@safe-global/safe-ethers-lib/dist/src/contracts/MultiSendCallOnly/MultiSendCallOnlyEthersContract'

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}
import type { EIP1193Provider, OnboardAPI, WalletState, AppState } from '@web3-onboard/core'
import { hexZeroPad } from 'ethers/lib/utils'

// Mock getTransactionDetails
jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  getTransactionDetails: jest.fn(),
  postSafeGasEstimation: jest.fn(() => Promise.resolve({ safeTxGas: 60000, recommendedNonce: 17 })),
  Operation: {
    CALL: 0,
  },
}))

// Mock extractTxInfo
jest.mock('../extractTxInfo', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    txParams: {},
    signatures: [],
  })),
}))

// Mock proposeTx
jest.mock('../proposeTransaction', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ txId: '123' })),
}))

const mockProvider = {
  request: jest.fn,
} as unknown as EIP1193Provider

const mockOnboardState = {
  chains: [],
  walletModules: [],
  wallets: [
    {
      label: 'Wallet 1',
      icon: '',
      provider: mockProvider,
      chains: [{ id: '0x5' }],
      accounts: [
        {
          address: '0x1234567890123456789012345678901234567890',
          ens: null,
          balance: null,
        },
      ],
    },
  ] as WalletState[],
  accountCenter: {
    enabled: true,
  },
} as unknown as AppState

const mockOnboard = {
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
  state: {
    select: (key: keyof AppState) => ({
      subscribe: (next: any) => {
        next(mockOnboardState[key])

        return {
          unsubscribe: jest.fn(),
        }
      },
    }),
    get: () => mockOnboardState,
  },
} as unknown as OnboardAPI

// Mock Safe SDK
const mockSafeSDK = {
  createTransaction: jest.fn(() => ({
    signatures: new Map(),
    addSignature: jest.fn(),
  })),
  createRejectionTransaction: jest.fn(() => ({
    addSignature: jest.fn(),
  })),
  signTransaction: jest.fn(),
  executeTransaction: jest.fn(() =>
    Promise.resolve({
      transactionResponse: {
        wait: jest.fn(() => Promise.resolve({})),
      },
    }),
  ),
  connect: jest.fn(() => Promise.resolve(mockSafeSDK)),
  getChainId: jest.fn(() => Promise.resolve(4)),
  getAddress: jest.fn(() => '0x0000000000000000000000000000000000000123'),
  getTransactionHash: jest.fn(() => Promise.resolve('0x1234567890')),
  getContractVersion: jest.fn(() => Promise.resolve('1.1.1')),
} as unknown as Safe

describe('txSender', () => {
  beforeAll(() => {
    setSafeSDK(mockSafeSDK)

    jest.spyOn(txEvents, 'txDispatch')
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTx', () => {
    it('should create a tx', async () => {
      const txParams = {
        to: '0x123',
        value: '1',
        data: '0x0',
      }
      await createTx(txParams)

      const safeTransactionData = {
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 17,
        safeTxGas: 60000,
      }
      expect(mockSafeSDK.createTransaction).toHaveBeenCalledWith({ safeTransactionData })
    })

    it('should create a tx with a given nonce', async () => {
      const txParams = {
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 100,
      }
      await createTx(txParams, 18)

      const safeTransactionData = {
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 18,
      }
      expect(mockSafeSDK.createTransaction).toHaveBeenCalledWith({ safeTransactionData })
    })

    it('should create a tx with initial txParams if gas estimation fails', async () => {
      // override postSafeGasEstimation default implementation
      ;(postSafeGasEstimation as jest.Mock)
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to retrieve recommended nonce #1')))
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to retrieve recommended nonce #2')))

      const txParams = {
        to: '0x123',
        value: '1',
        data: '0x0',
      }
      await createTx(txParams)

      // Shallow copy of txParams
      const safeTransactionData = Object.assign({}, txParams)

      // calls SDK createTransaction withouth recommended nonce
      expect(mockSafeSDK.createTransaction).toHaveBeenCalledWith({ safeTransactionData })
    })
  })

  describe('createExistingTx', () => {
    it('should create a tx from an existing proposal', async () => {
      const tx = await createExistingTx('4', '0x123', '0x345')

      expect(getTransactionDetails).toHaveBeenCalledWith('4', '0x345')
      expect(extractTxInfo).toHaveBeenCalled()
      expect(mockSafeSDK.createTransaction).toHaveBeenCalled()

      expect(tx).toBeDefined()
      expect(tx.addSignature).toBeDefined()
    })
  })

  describe('createRejectTx', () => {
    it('should create a tx to reject a proposal', async () => {
      const tx = await createRejectTx(1)

      expect(mockSafeSDK.createRejectionTransaction).toHaveBeenCalledWith(1)
      expect(tx).toBeDefined()
      expect(tx.addSignature).toBeDefined()
    })
  })

  describe('dispatchTxProposal', () => {
    it('should dispatch a tx proposal', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      const proposedTx = await dispatchTxProposal({ chainId: '4', safeAddress: '0x123', sender: '0x456', safeTx: tx })

      expect(proposeTx).toHaveBeenCalledWith('4', '0x123', '0x456', tx, '0x1234567890', undefined)
      expect(proposedTx).toEqual({ txId: '123' })

      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROPOSED', { txId: '123' })
    })

    it('should dispatch a tx proposal with a signature', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      const proposedTx = await dispatchTxProposal({
        chainId: '4',
        safeAddress: '0x123',
        sender: '0x456',
        safeTx: tx,
        txId: '345',
      })

      expect(proposeTx).toHaveBeenCalledWith('4', '0x123', '0x456', tx, '0x1234567890', undefined)
      expect(proposedTx).toEqual({ txId: '123' })

      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNATURE_PROPOSED', { txId: '123', signerAddress: '0x456' })
    })

    it('should fail to propose a signature', async () => {
      ;(proposeTx as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('error')))

      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      await expect(
        dispatchTxProposal({ chainId: '4', safeAddress: '0x123', sender: '0x456', safeTx: tx, txId: '345' }),
      ).rejects.toThrow('error')

      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNATURE_PROPOSE_FAILED', {
        txId: '345',
        error: new Error('error'),
      })
    })

    it('should fail to propose a new tx', async () => {
      ;(proposeTx as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('error')))

      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      await expect(
        dispatchTxProposal({ chainId: '4', safeAddress: '0x123', sender: '0x456', safeTx: tx }),
      ).rejects.toThrow('error')

      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROPOSE_FAILED', {
        error: new Error('error'),
      })
    })
  })

  describe('dispatchTxSigning', () => {
    it('should sign a tx', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      const signedTx = await dispatchTxSigning(tx, '1.3.0', mockOnboard, '5', '0x345')

      expect(mockSafeSDK.createTransaction).toHaveBeenCalled()

      expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
      expect(mockSafeSDK.signTransaction).not.toHaveBeenCalledWith(expect.anything(), 'eth_sign')

      expect(signedTx).not.toBe(tx)

      expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error: new Error('error') })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
    })

    it('should only sign with `eth_signTypedData` on older Safes', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      const signedTx = await dispatchTxSigning(tx, '1.0.0', mockOnboard, '5', '0x345')

      expect(mockSafeSDK.createTransaction).toHaveBeenCalledTimes(1)

      expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
      expect(mockSafeSDK.signTransaction).not.toHaveBeenCalledWith(expect.anything(), 'eth_sign')

      expect(signedTx).not.toBe(tx)

      expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error: new Error('error') })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
    })

    it("should only sign with `eth_signTypedData` for unsupported contracts (backend returns `SafeInfo['version']` as `null`)", async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      const signedTx = await dispatchTxSigning(tx, null, mockOnboard, '5', '0x345')

      expect(mockSafeSDK.createTransaction).toHaveBeenCalledTimes(1)

      expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
      expect(mockSafeSDK.signTransaction).not.toHaveBeenCalledWith(expect.anything(), 'eth_sign')

      expect(signedTx).not.toBe(tx)

      expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error: new Error('error') })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
    })

    it('should iterate over each signing method on newer Safes', async () => {
      ;(mockSafeSDK.signTransaction as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('error'))) // `eth_signTypedData` fails

      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      const signedTx = await dispatchTxSigning(tx, '1.3.0', mockOnboard, '5', '0x345')

      expect(mockSafeSDK.createTransaction).toHaveBeenCalledTimes(1)

      expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
      expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_sign')

      expect(signedTx).not.toBe(tx)

      expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error: new Error('error') })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
    })

    it('should not iterate over the sequential signing method if the previous threw a rejection error', async () => {
      ;(mockSafeSDK.signTransaction as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('rejected'))) // `eth_signTypedData` fails

      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      let signedTx

      try {
        signedTx = await dispatchTxSigning(tx, '1.3.0', mockOnboard, '5', '0x345')
      } catch (error) {
        expect(mockSafeSDK.createTransaction).toHaveBeenCalledTimes(1)

        expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
        expect(mockSafeSDK.signTransaction).not.toHaveBeenCalledWith(expect.anything(), 'eth_sign')

        expect(signedTx).not.toBe(tx)

        expect((error as Error).message).toBe('rejected')

        expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error })
        expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
      }
    })

    it('should throw the non-rejection error if it is the final signing method', async () => {
      ;(mockSafeSDK.signTransaction as jest.Mock)
        .mockImplementationOnce(() => Promise.reject(new Error('error'))) // `eth_signTypedData` fails
        .mockImplementationOnce(() => Promise.reject(new Error('failure-specific error'))) // `eth_sign` fails

      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      let signedTx

      try {
        signedTx = await dispatchTxSigning(tx, '1.3.0', mockOnboard, '5', '0x345')
      } catch (error) {
        expect(mockSafeSDK.createTransaction).toHaveBeenCalledTimes(1)

        expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_signTypedData')
        expect(mockSafeSDK.signTransaction).toHaveBeenCalledWith(expect.anything(), 'eth_sign')

        expect(signedTx).not.toBe(tx)

        expect((error as Error).message).toBe('failure-specific error')

        expect(txEvents.txDispatch).toHaveBeenCalledWith('SIGN_FAILED', { txId: '0x345', error })
        expect(txEvents.txDispatch).not.toHaveBeenCalledWith('SIGNED', { txId: '0x345' })
      }
    })
  })

  describe('dispatchTxExecution', () => {
    it('should execute a tx', async () => {
      const txId = 'tx_id_123'
      const safeAddress = hexZeroPad('0x123', 20)

      const safeTx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      await dispatchTxExecution(safeTx, {}, txId, mockOnboard, '5', safeAddress)

      expect(mockSafeSDK.executeTransaction).toHaveBeenCalled()
      expect(txEvents.txDispatch).toHaveBeenCalledWith('EXECUTING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROCESSING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROCESSED', { txId, safeAddress })
    })

    it('should fail executing a tx', async () => {
      jest.spyOn(mockSafeSDK, 'executeTransaction').mockImplementationOnce(() => Promise.reject(new Error('error')))

      const txId = 'tx_id_123'
      const safeAddress = hexZeroPad('0x123', 20)

      const safeTx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      await expect(dispatchTxExecution(safeTx, {}, txId, mockOnboard, '5', safeAddress)).rejects.toThrow('error')

      expect(mockSafeSDK.executeTransaction).toHaveBeenCalled()
      expect(txEvents.txDispatch).toHaveBeenCalledWith('FAILED', { txId, error: new Error('error') })
    })

    it('should revert a tx', async () => {
      jest.spyOn(mockSafeSDK, 'executeTransaction').mockImplementationOnce(() =>
        Promise.resolve({
          transactionResponse: {
            wait: jest.fn(() => Promise.resolve({ status: 0 })),
          },
        } as unknown as TransactionResult),
      )

      const txId = 'tx_id_123'

      const safeTx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      await dispatchTxExecution(safeTx, {}, txId, mockOnboard, '5', '0x123')

      expect(mockSafeSDK.executeTransaction).toHaveBeenCalled()
      expect(txEvents.txDispatch).toHaveBeenCalledWith('EXECUTING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROCESSING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('REVERTED', {
        txId,
        error: new Error('Transaction reverted by EVM'),
      })
    })

    it('should cancel a tx', async () => {
      jest.spyOn(mockSafeSDK, 'executeTransaction').mockImplementationOnce(() =>
        Promise.resolve({
          transactionResponse: {
            wait: jest.fn(() => Promise.reject({ code: ErrorCode.TRANSACTION_REPLACED, reason: 'cancelled' })),
          },
        } as unknown as TransactionResult),
      )

      const txId = 'tx_id_123'

      const safeTx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      await dispatchTxExecution(safeTx, {}, txId, mockOnboard, '5', '0x123')

      expect(mockSafeSDK.executeTransaction).toHaveBeenCalled()
      expect(txEvents.txDispatch).toHaveBeenCalledWith('EXECUTING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROCESSING', { txId })

      await waitFor(() =>
        expect(txEvents.txDispatch).toHaveBeenCalledWith('FAILED', {
          txId: 'tx_id_123',
          error: { code: ErrorCode.TRANSACTION_REPLACED, reason: 'cancelled' },
        }),
      )
    })

    it('should reprice a tx', async () => {
      jest.spyOn(mockSafeSDK, 'executeTransaction').mockImplementationOnce(() =>
        Promise.resolve({
          transactionResponse: {
            wait: jest.fn(() => Promise.reject({ code: ErrorCode.TRANSACTION_REPLACED, reason: 'repriced' })),
          },
        } as unknown as TransactionResult),
      )

      const txId = 'tx_id_123'

      const safeTx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
        nonce: 1,
      })

      await dispatchTxExecution(safeTx, {}, txId, mockOnboard, '5', '0x123')

      expect(mockSafeSDK.executeTransaction).toHaveBeenCalled()
      expect(txEvents.txDispatch).toHaveBeenCalledWith('EXECUTING', { txId })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('PROCESSING', { txId })
      expect(txEvents.txDispatch).not.toHaveBeenCalledWith('FAILED')
    })
  })

  describe('dispatchBatchExecutionRelay', () => {
    it('should relay a batch execution', async () => {
      const mockMultisendAddress = ethers.utils.hexZeroPad('0x1234', 20)
      const safeAddress = hexZeroPad('0x567', 20)

      const txDetails1 = {
        txId: 'multisig_0x01',
      } as TransactionDetails

      const txDetails2 = {
        txId: 'multisig_0x02',
      } as TransactionDetails

      const txs = [txDetails1, txDetails2]

      const expectedData = '0xfefe'

      const multisendContractMock = {
        contract: {
          interface: {
            encodeFunctionData: jest.fn(() => expectedData),
          },
        } as any,
        getAddress: () => mockMultisendAddress,
      } as MultiSendCallOnlyEthersContract

      jest
        .spyOn(safeContracts, 'getReadOnlyMultiSendCallOnlyContract')
        .mockImplementation(() => multisendContractMock as any)

      const mockData = {
        taskId: '0xdead1',
      }
      global.fetch = jest.fn().mockImplementationOnce(setupFetchStub(mockData))

      await dispatchBatchExecutionRelay(txs, multisendContractMock, '0x1234', '5', safeAddress)

      expect(txEvents.txDispatch).toHaveBeenCalledWith('RELAYING', {
        txId: 'multisig_0x01',
        groupKey: '0x1234',
        taskId: '0xdead1',
      })
      expect(txEvents.txDispatch).toHaveBeenCalledWith('RELAYING', {
        txId: 'multisig_0x02',
        groupKey: '0x1234',
        taskId: '0xdead1',
      })
    })
  })
})
