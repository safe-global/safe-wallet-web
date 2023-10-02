import { renderHook, act } from '@/tests/test-utils'
import useSafeWalletProvider, { _useTxFlowApi } from './useSafeWalletProvider'
import * as web3 from '@/hooks/wallets/web3'
import * as gateway from '@safe-global/safe-gateway-typescript-sdk'

describe('useSafeWalletProvider', () => {
  it('should return a provider', async () => {
    const { result } = renderHook(() => useSafeWalletProvider())
    await act(() => Promise.resolve())
    expect(result.current).toBeDefined()
  })

  describe.only('_useTxFlowApi', () => {
    it('should return a provider', async () => {
      const { result } = renderHook(() => _useTxFlowApi('1', '0x1234567890000000000000000000000000000000'))
      await act(() => Promise.resolve())
      expect(result.current?.getBySafeTxHash).toBeDefined()
      expect(result.current?.proxy).toBeDefined()
      expect(result.current?.send).toBeDefined()
      expect(result.current?.signMessage).toBeDefined()
      expect(result.current?.signTypedMessage).toBeDefined()
      expect(result.current?.switchChain).toBeDefined()
    })

    it('should proxy RPC calls', async () => {
      const mockSend = jest.fn(() => Promise.resolve({ result: '0x' }))

      jest.spyOn(web3 as any, 'useWeb3ReadOnly').mockImplementation(() => ({
        send: mockSend,
      }))

      const { result } = renderHook(() => _useTxFlowApi('1', '0x1234567890000000000000000000000000000000'))
      await act(() => Promise.resolve())

      result.current?.proxy('eth_chainId', [])
      expect(mockSend).toHaveBeenCalledWith('eth_chainId', [])
    })

    it('should should send transactions', async () => {
      const mockSend = jest.fn(() => Promise.resolve({ result: '0x' }))

      jest.spyOn(web3 as any, 'useWeb3ReadOnly').mockImplementation(() => ({
        send: mockSend,
      }))

      const { result } = renderHook(() => _useTxFlowApi('1', '0x1234567890000000000000000000000000000000'))

      const resp = result.current?.send(
        {
          txs: [
            {
              to: '0x1234567890000000000000000000000000000000',
              value: '0',
              data: '0x',
            },
          ],
          params: { safeTxGas: 0 },
        },
        { name: 'test', description: '', url: '', iconUrl: 'test.svg' },
      )

      expect(resp).toBeInstanceOf(Promise)
    })

    it('should get tx by safe tx hash', async () => {
      jest.spyOn(gateway as any, 'getTransactionDetails').mockImplementation(() => ({
        hash: '0x123',
      }))

      const { result } = renderHook(() => _useTxFlowApi('1', '0x1234567890000000000000000000000000000000'))

      await act(() => Promise.resolve())

      const resp = await result.current?.getBySafeTxHash('0x123456789000')

      expect(gateway.getTransactionDetails).toHaveBeenCalledWith('1', '0x123456789000')
      expect(resp).toEqual({ hash: '0x123' })
    })
  })
})
