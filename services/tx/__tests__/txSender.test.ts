import { setSafeSDK } from '@/services/safe-core/useInitSafeCoreSDK'
import Safe from '@gnosis.pm/safe-core-sdk'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import extractTxInfo from '../extractTxInfo'
import proposeTx from '../proposeTransaction'
import {
  createExistingTx,
  createRejectTx,
  createTx,
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxSigning,
} from '../txSender'

// Mock getTransactionDetails
jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  getTransactionDetails: jest.fn(),
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
  executeTransaction: jest.fn(),
} as unknown as Safe

describe('txSender', () => {
  beforeAll(() => {
    setSafeSDK(mockSafeSDK)
  })

  describe('createTx', () => {
    it('should create a tx', async () => {
      const txParams = {
        to: '0x123',
        value: '1',
        data: '0x0',
      }
      const tx = await createTx(txParams)

      expect(mockSafeSDK.createTransaction).toHaveBeenCalledWith(txParams)
    })
  })

  describe('createExistingTx', () => {
    it('should create a tx from an existing proposal', async () => {
      const tx = await createExistingTx('4', '0x123', {
        id: '0x345',
      } as unknown as TransactionSummary)

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

      const proposedTx = await dispatchTxProposal('4', '0x123', '0x456', tx)

      expect(proposeTx).toHaveBeenCalledWith('4', '0x123', '0x456', tx)
      expect(proposedTx).toEqual({ txId: '123' })
    })
  })

  describe('dispatchTxSigning', () => {
    it('should sign a tx', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      const signedTx = await dispatchTxSigning(tx, '0x345')

      expect(mockSafeSDK.createTransaction).toHaveBeenCalled()
      expect(signedTx).toBe(tx)
    })
  })

  describe('dispatchTxExecution', () => {
    it('should execute a tx', async () => {
      const tx = await createTx({
        to: '0x123',
        value: '1',
        data: '0x0',
      })

      expect(dispatchTxExecution).toBeDefined()

      // TODO: after PromiEvent is replaced

      // const hash = await dispatchTxExecution(tx)

      // expect(mockSafeSDK.executeTransaction).toHaveBeenCalledWith(tx)
      // expect(hash).toBeDefined()
    })
  })
})
