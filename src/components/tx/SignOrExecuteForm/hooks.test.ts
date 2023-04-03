import { renderHook } from '@/tests/test-utils'
import { ethers } from 'ethers'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type ConnectedWallet } from '@/services/onboard'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as wallet from '@/hooks/wallets/useWallet'
import * as pending from '@/hooks/usePendingTxs'
import * as txSender from '@/services/tx/tx-sender'
import { useImmediatelyExecutable, useIsExecutionLoop, useTxActions, useValidateNonce } from './hooks'
import { createSafeTx } from './SignOrExecuteForm.test'

describe('SignOrExecute hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useValidateNonce', () => {
    it('should return true if nonce is correct', () => {
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

      const { result } = renderHook(() => useValidateNonce(createSafeTx()))

      expect(result.current).toBe(true)
    })

    it('should return false if nonce is incorrect', () => {
      jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
        safe: {
          nonce: 90,
          threshold: 2,
          owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }, { value: ethers.utils.hexZeroPad('0x456', 20) }],
        } as SafeInfo,
        safeAddress: '0x123',
        safeError: undefined,
        safeLoading: false,
        safeLoaded: true,
      }))

      const { result } = renderHook(() => useValidateNonce(createSafeTx()))

      expect(result.current).toBe(false)
    })
  })

  describe('useIsExecutionLoop', () => {
    it('should return true when a safe is executing its own transaction', () => {
      const address = ethers.utils.hexZeroPad('0x789', 20)

      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: address,
        safe: {
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

      const { result } = renderHook(() => useIsExecutionLoop())

      expect(result.current).toBe(true)
    })

    it('should return false when a safe is not executing its own transaction', () => {
      jest.spyOn(wallet, 'default').mockReturnValue({
        chainId: '1',
        label: 'MetaMask',
        address: ethers.utils.hexZeroPad('0x456', 20),
      } as ConnectedWallet)

      const { result } = renderHook(() => useIsExecutionLoop())

      expect(result.current).toBe(false)
    })
  })

  describe('useImmediatelyExecutable', () => {
    it('should return true for newly created transactions with threshold 1 and no pending transactions', () => {
      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: '0x123',
        safe: {
          owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }],
          threshold: 1,
          nonce: 100,
        } as SafeInfo,
        safeLoaded: true,
        safeLoading: false,
        safeError: undefined,
      })

      jest.spyOn(pending, 'useHasPendingTxs').mockReturnValue(false)

      const { result } = renderHook(() => useImmediatelyExecutable())

      expect(result.current).toBe(true)
    })

    it('should return false for newly created transactions with threshold > 1', () => {
      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: '0x123',
        safe: {
          owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }],
          threshold: 2,
          nonce: 100,
        } as SafeInfo,
        safeLoaded: true,
        safeLoading: false,
        safeError: undefined,
      })

      jest.spyOn(pending, 'useHasPendingTxs').mockReturnValue(false)

      const { result } = renderHook(() => useImmediatelyExecutable())

      expect(result.current).toBe(false)
    })

    it('should return false for safes with pending transactions', () => {
      jest.spyOn(useSafeInfoHook, 'default').mockReturnValue({
        safeAddress: '0x123',
        safe: {
          owners: [{ value: ethers.utils.hexZeroPad('0x123', 20) }],
          threshold: 1,
          nonce: 100,
        } as SafeInfo,
        safeLoaded: true,
        safeLoading: false,
        safeError: undefined,
      })

      jest.spyOn(pending, 'useHasPendingTxs').mockReturnValue(true)

      const { result } = renderHook(() => useImmediatelyExecutable())

      expect(result.current).toBe(false)
    })
  })

  describe('useTxActions', () => {
    it('should return sign and execute actions', () => {
      const { result } = renderHook(() => useTxActions())

      expect(result.current.signTx).toBeDefined()
      expect(result.current.executeTx).toBeDefined()
    })

    it('should sign a tx with or without an id', async () => {
      jest
        .spyOn(txSender, 'dispatchTxProposal')
        .mockImplementation((() => Promise.resolve({ txId: '123' })) as unknown as typeof txSender.dispatchTxProposal)
      jest.spyOn(txSender, 'dispatchTxSigning').mockImplementation(() => Promise.resolve(createSafeTx()))

      const { result } = renderHook(() => useTxActions())
      const { signTx } = result.current

      const id = await signTx(createSafeTx())
      expect(id).toBe('123')

      const id2 = await signTx(createSafeTx(), '456')
      expect(id2).toBe('123')
    })

    it('should execute a tx', async () => {
      jest
        .spyOn(txSender, 'dispatchTxProposal')
        .mockImplementation((() => Promise.resolve({ txId: '123' })) as unknown as typeof txSender.dispatchTxProposal)
      jest
        .spyOn(txSender, 'dispatchTxExecution')
        .mockImplementation((() => Promise.resolve(createSafeTx())) as unknown as typeof txSender.dispatchTxExecution)

      const { result } = renderHook(() => useTxActions())
      const { executeTx } = result.current

      const id = await executeTx({ gasPrice: 1 }, createSafeTx())
      expect(id).toEqual('123')

      const id2 = await executeTx({ gasPrice: 1 }, createSafeTx(), '455')
      expect(id2).toEqual('455')
    })

    it('should throw an error if the tx is undefined', async () => {
      const { result } = renderHook(() => useTxActions())
      const { signTx, executeTx } = result.current

      // Expect signTx to throw an error
      await expect(signTx()).rejects.toThrowError('Transaction not provided')
      await expect(executeTx({ gasPrice: 1 })).rejects.toThrowError('Transaction not provided')
    })
  })
})
