import type { JsonRpcProvider } from '@ethersproject/providers'

import * as chains from '@/hooks/useChains'
import * as pendingSafe from '../usePendingSafe'
import * as web3 from '@/hooks/wallets/web3'
import { useSyncZkEvmSafeAddress } from '../StatusStepper'
import { renderHook, waitFor } from '@/tests/test-utils'
import { SafeCreationStatus } from '../useSafeCreation'
import type { PendingSafeData } from '../../../types'

describe('StatusStepper', () => {
  describe('useSyncZkEvmSafeAddress', () => {
    const receipt = {
      to: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
      from: '0xbbeedB6d8e56e23f5812e59d1b6602F15957271F',
      contractAddress: null,
      transactionIndex: 35,
      gasUsed: {
        _hex: '0x03f250',
        _isBigNumber: true,
      },
      logsBloom:
        '0x00080000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000010000000000000000000000000000010000000000008000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000010000000000000040000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000080000000000000000000000000020000000000008000000000000000001',
      blockHash: '0xc0c483b03c7b7f22be963f104376edfde86bfdb55ae936dc3e0da0babdbc2840',
      transactionHash: '0x3cd978744f5515be16affda1a66a94216e66d3d2511936b48da7e877eee75730',
      logs: [
        // SafeSetup
        {
          transactionIndex: 35,
          blockNumber: 4106310,
          transactionHash: '0x3cd978744f5515be16affda1a66a94216e66d3d2511936b48da7e877eee75730',
          address: '0x23cd51f5FD95EeDEd50E16fEa2e729d7e89cb5A0',
          topics: [
            '0x141df868a6331af528e38c83b7aa03edc19be66e37ae67f9285bf4f8e3c6a1a8',
            '0x000000000000000000000000c22834581ebc8527d974f8a1c97e1bea4ef910bc',
          ],
          data: '0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017062a1de2fe6b99be3d9d37841fed19f5738040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bbeedb6d8e56e23f5812e59d1b6602f15957271f',
          logIndex: 17,
          blockHash: '0xc0c483b03c7b7f22be963f104376edfde86bfdb55ae936dc3e0da0babdbc2840',
        },
        // ProxyCreation
        {
          transactionIndex: 35,
          blockNumber: 4106310,
          transactionHash: '0x3cd978744f5515be16affda1a66a94216e66d3d2511936b48da7e877eee75730',
          address: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
          topics: ['0x4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235'],
          data: '0x00000000000000000000000023cd51f5fd95eeded50e16fea2e729d7e89cb5a0000000000000000000000000fb1bffc9d739b8d520daf37df666da4c687191ea',
          logIndex: 18,
          blockHash: '0xc0c483b03c7b7f22be963f104376edfde86bfdb55ae936dc3e0da0babdbc2840',
        },
      ],
      blockNumber: 4106310,
      confirmations: 393,
      cumulativeGasUsed: {
        _hex: '0x45d281',
        _isBigNumber: true,
      },
      effectiveGasPrice: {
        _hex: '0x015c11f9e6',
        _isBigNumber: true,
      },
      status: 1,
      type: 2,
      byzantium: true,
    }

    it('should set the Safe address', async () => {
      const mockPendingSafe = { txHash: '0x123' } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(true)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      renderHook(() => useSyncZkEvmSafeAddress(SafeCreationStatus.SUCCESS))

      await waitFor(() => {
        expect(mockSetPendingSafe).toHaveBeenCalledWith({
          ...mockPendingSafe,
          safeAddress: '0x23cd51f5FD95EeDEd50E16fEa2e729d7e89cb5A0',
        })
      })
    })

    it('should not set the Safe address if the feature is disabled', async () => {
      const mockPendingSafe = { txHash: '0x123' } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(false)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      renderHook(() => useSyncZkEvmSafeAddress(SafeCreationStatus.SUCCESS))

      await waitFor(() => {
        expect(mockSetPendingSafe).not.toHaveBeenCalled()
      })
    })

    it('should not set the Safe address if the creation is not successful', () => {
      const mockPendingSafe = { txHash: '0x123' } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(true)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      Object.values(SafeCreationStatus)
        .filter((status) => status !== SafeCreationStatus.SUCCESS)
        .forEach(async (status) => {
          renderHook(() => useSyncZkEvmSafeAddress(status as SafeCreationStatus))

          await waitFor(() => {
            expect(mockSetPendingSafe).not.toHaveBeenCalled()
          })
        })
    })

    it('should not set the Safe address if there is no transaction hash', async () => {
      const mockPendingSafe = { txHash: undefined } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(true)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      renderHook(() => useSyncZkEvmSafeAddress(SafeCreationStatus.SUCCESS))

      await waitFor(() => {
        expect(mockSetPendingSafe).not.toHaveBeenCalled()
      })
    })

    it('should not set the Safe address if there is already an address', async () => {
      const mockPendingSafe = {
        txHash: '0x123',
        safeAddress: '0x23cd51f5FD95EeDEd50E16fEa2e729d7e89cb5A0',
      } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(true)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      renderHook(() => useSyncZkEvmSafeAddress(SafeCreationStatus.SUCCESS))

      await waitFor(() => {
        expect(mockSetPendingSafe).not.toHaveBeenCalled()
      })
    })

    it('should not set the Safe address if there is no ProxyCreation log', async () => {
      const mockPendingSafe = { txHash: '0x123' } as PendingSafeData
      const mockSetPendingSafe = jest.fn()

      jest.spyOn(chains, 'useHasFeature').mockReturnValue(true)
      jest.spyOn(pendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, mockSetPendingSafe])

      // Remove ProxyCreationLog
      receipt.logs.pop()
      jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
        getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
      } as unknown as JsonRpcProvider)

      renderHook(() => useSyncZkEvmSafeAddress(SafeCreationStatus.SUCCESS))

      await waitFor(() => {
        expect(mockSetPendingSafe).toHaveBeenCalledWith({
          ...mockPendingSafe,
          safeAddress: undefined,
        })
      })
    })
  })
})
